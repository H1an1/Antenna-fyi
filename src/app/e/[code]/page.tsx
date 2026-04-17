import { redirect } from "next/navigation";

export default async function RedirectEvent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/events/${code}`);
}
