import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const session = vi.hoisted(() => ({ merchant: null as null | { id: string; slug: string } }));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getCurrentMerchant: async () => session.merchant,
    requireMerchant: async () => session.merchant,
  };
});

const { prisma } = await import("@/lib/db");
const { createPublicOrder } = await import("@/lib/actions/orders");
const { updateOrderStatus } = await import("@/lib/actions/store");

type Fixtures = {
  merchantId: string;
  slug: string;
  wax: { id: string; price: number; stock: number };
  sac: { id: string; price: number; stock: number };
};

async function fixtures(): Promise<Fixtures> {
  const merchant = await prisma.merchant.create({
    data: {
      name: "Awa Koné",
      storeName: "Chez Awa",
      slug: "chez-awa-test",
      phone: "0700000001",
      whatsapp: "0700000001",
      passwordHash: "x",
      plan: "FREE",
    },
  });

  const wax = await prisma.product.create({
    data: {
      merchantId: merchant.id,
      name: "Ensemble wax",
      price: 15000,
      stock: 5,
      images: JSON.stringify(["/uploads/demo-1.svg"]),
    },
  });
  const sac = await prisma.product.create({
    data: {
      merchantId: merchant.id,
      name: "Sac raphia",
      price: 5000,
      stock: 1,
      images: JSON.stringify(["/uploads/demo-2.svg"]),
    },
  });

  session.merchant = { id: merchant.id, slug: merchant.slug };
  return {
    merchantId: merchant.id,
    slug: merchant.slug,
    wax: { id: wax.id, price: wax.price, stock: wax.stock },
    sac: { id: sac.id, price: sac.price, stock: sac.stock },
  };
}

function orderForm(slug: string, items: unknown, phone = "0709000000") {
  const data = new FormData();
  data.set("slug", slug);
  data.set("customerName", "Client Test");
  data.set("customerPhone", phone);
  data.set("deliveryNote", "Cocody, près du marché");
  data.set("items", JSON.stringify(items));
  return data;
}

beforeEach(async () => {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
  session.merchant = null;
});

describe("createPublicOrder", () => {
  it("enregistre la commande, calcule le total et décrémente le stock", async () => {
    const f = await fixtures();

    const state = await createPublicOrder(
      {},
      orderForm(f.slug, [{ productId: f.wax.id, quantity: 2 }]),
    );

    expect(state.error).toBeUndefined();
    expect(state.order?.total).toBe(30000);
    expect(state.order?.reference).toMatch(/^CMD-\d{4}-[A-Z0-9]{3}$/);

    const saved = await prisma.order.findUnique({ where: { reference: state.order!.reference } });
    expect(saved?.customerName).toBe("Client Test");
    expect(saved?.status).toBe("NOUVELLE");

    const wax = await prisma.product.findUnique({ where: { id: f.wax.id } });
    expect(wax?.stock).toBe(3);
  });

  it("ignore les prix envoyés par le navigateur", async () => {
    const f = await fixtures();

    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.wax.id, quantity: 1, price: 1 },
    ]));

    expect(state.order?.total).toBe(15000);
  });

  it("refuse une quantité supérieure au stock", async () => {
    const f = await fixtures();

    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.sac.id, quantity: 3 },
    ]));

    expect(state.error).toMatch(/Stock insuffisant/);
    expect(await prisma.order.count()).toBe(0);
    const sac = await prisma.product.findUnique({ where: { id: f.sac.id } });
    expect(sac?.stock).toBe(1);
  });

  it("refuse un panier vide et un numéro invalide", async () => {
    const f = await fixtures();

    const empty = await createPublicOrder({}, orderForm(f.slug, []));
    expect(empty.error).toBeDefined();

    const badPhone = await createPublicOrder({}, orderForm(f.slug, [{ productId: f.wax.id, quantity: 1 }], "12"));
    expect(badPhone.error).toBeDefined();
  });

  it("refuse un produit masqué ou appartenant à une autre boutique", async () => {
    const f = await fixtures();
    await prisma.product.update({ where: { id: f.wax.id }, data: { active: false } });

    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.wax.id, quantity: 1 },
    ]));

    expect(state.error).toMatch(/plus disponible/);
  });
});

describe("updateOrderStatus", () => {
  it("remet les articles en stock quand la commande est annulée", async () => {
    const f = await fixtures();
    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.wax.id, quantity: 2 },
    ]));
    expect(state.order).toBeDefined();

    const order = await prisma.order.findUniqueOrThrow({ where: { reference: state.order!.reference } });

    const form = new FormData();
    form.set("id", order.id);
    form.set("status", "ANNULEE");
    await updateOrderStatus(form);

    const updated = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(updated.status).toBe("ANNULEE");

    const wax = await prisma.product.findUniqueOrThrow({ where: { id: f.wax.id } });
    expect(wax.stock).toBe(5);
  });

  it("refuse un statut inconnu", async () => {
    const f = await fixtures();
    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.wax.id, quantity: 1 },
    ]));
    const order = await prisma.order.findUniqueOrThrow({ where: { reference: state.order!.reference } });

    const form = new FormData();
    form.set("id", order.id);
    form.set("status", "PIRATE");
    await updateOrderStatus(form);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("NOUVELLE");
  });

  it("ne modifie pas la commande d'une autre boutique", async () => {
    const f = await fixtures();
    const state = await createPublicOrder({}, orderForm(f.slug, [
      { productId: f.wax.id, quantity: 1 },
    ]));
    const order = await prisma.order.findUniqueOrThrow({ where: { reference: state.order!.reference } });

    const other = await prisma.merchant.create({
      data: {
        name: "Autre",
        storeName: "Autre",
        slug: "autre-boutique",
        phone: "0700000002",
        whatsapp: "0700000002",
        passwordHash: "x",
      },
    });
    session.merchant = { id: other.id, slug: other.slug };

    const form = new FormData();
    form.set("id", order.id);
    form.set("status", "LIVREE");
    await updateOrderStatus(form);

    const unchanged = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
    expect(unchanged.status).toBe("NOUVELLE");
  });
});
