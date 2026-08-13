import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}