import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/photoshoots?view=public')
}
