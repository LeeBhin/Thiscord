import Image from "next/image";
import notFound from '@/../../public/images/404gif.gif'

export default function NotFound() {
  return (
    <main>
      <Image src={notFound} alt="notfound"></Image>
      <h1>404 not found</h1>
    </main>
  );
}
