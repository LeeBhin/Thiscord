import Image from "next/image";
import notFound from '@/../../public/images/404gif.gif'

export default function NotFound() {
  return (
    <main>
      <Image src={notFound} width={404} height={404} style={{ 'position': 'absolute' }} alt="404"></Image>
      <h1>404 not found</h1>
    </main>
  );
}
