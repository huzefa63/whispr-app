import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "./_components/QueryProvider";
import SocketProvider from "./_components/SocketProvider";

const inter = Poppins({
  variable: "inter",
  subsets: ["latin"],
  weight:'400'
});

export const metadata = {
  title: "WHISPR",
  description: "chatting platform",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-auto antialiased`}>
        <QueryProvider>
          <SocketProvider>{children}</SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
