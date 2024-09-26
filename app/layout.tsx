import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Chess",
  description: "Chess web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`display-block antialiased bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
