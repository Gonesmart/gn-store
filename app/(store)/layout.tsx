import { StoreNavbar } from "@/components/store/navbar";
import { StoreFooter } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { CartProvider } from "@/components/providers/cart-provider";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </CartProvider>
  );
}
