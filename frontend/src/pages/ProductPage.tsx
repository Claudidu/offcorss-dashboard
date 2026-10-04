import { useParams } from 'react-router';

export default function ProductPage() {
  const { id } = useParams();
  return <main className="pa4 sans-serif"><h1>Producto {id}</h1></main>;
}