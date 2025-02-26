import UnsubscribeForm from "@/app/Components/UnsubscribeForm";

export default function Page({ params }: { params: { token: string } }) {
    return <UnsubscribeForm token={params.token} />;
}