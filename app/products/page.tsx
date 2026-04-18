import { redirect } from 'next/navigation'

// The standalone products page has been removed.
// Redirect to the product search page instead.
export default function ProductsPage() {
  redirect('/prodsearch')
}