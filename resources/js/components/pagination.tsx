import { Link } from '@inertiajs/react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination"

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <ShadcnPagination className="mt-4">
            <PaginationContent>
                {links.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationLink dangerouslySetInnerHTML={{ __html: link.label }} />
                            </PaginationItem>
                        );
                    }

                    if (index === 0) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationPrevious asChild>
                                    <Link href={link.url}>Anterior</Link>
                                </PaginationPrevious>
                            </PaginationItem>
                        );
                    }

                    if (index === links.length - 1) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationNext asChild>
                                    <Link href={link.url}>Siguiente</Link>
                                </PaginationNext>
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink asChild isActive={link.active}>
                                <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </ShadcnPagination>
    );
}
