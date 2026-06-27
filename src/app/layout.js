import "./global.css";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "API Tester",
  description: "Test APIs with ease",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body>
          <TooltipProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
