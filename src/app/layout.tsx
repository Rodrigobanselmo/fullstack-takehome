import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ApolloWrapper } from "~/providers/apollo-provider";
import { ModalProvider } from "~/components/ui/modal/modal-context";
import { ToastProvider } from "~/components/ui/toast";
import { ThemeProvider } from "~/context/theme-context";

export const metadata: Metadata = {
  title: "Recipe Manager",
  description: "Manage your recipes and ingredients",
  icons: [{ rel: "icon", url: "/icons/logo.svg" }],
};

const geist = Geist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider>
          <ApolloWrapper>
            <ToastProvider>
              <ModalProvider>{children}</ModalProvider>
            </ToastProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
