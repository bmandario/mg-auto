import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-gray-900 flex flex-col flex-1">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
