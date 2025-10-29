import { ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Button } from "./ui/button";

export default function BackButton({ href }: { href: string }) {
    return (
        <Link href={href} >
            <Button variant="outline" size="sm" className="p-4">
                <ArrowLeft className="w-5 h-5 " />
            </Button>
        </Link>
    );
}