import type { AppProps } from 'next/app';
import '../styles/globals.css'; // or your CSS path

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}