import AnnouncementBar from "@/components/public/AnnouncementBar";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CartDrawer from "@/components/public/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
