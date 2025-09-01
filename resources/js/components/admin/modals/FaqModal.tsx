import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { Faq } from '@/types/models';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    faq: Faq | null;
    categoryId: number | null;
}

export function FaqModal({ isOpen, onClose, faq, categoryId }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        question: '',
        answer: '',
        order: 0,
        faq_category_id: categoryId,
    });

    useEffect(() => {
        if (isOpen) {
            if (faq) {
                setData({
                    question: faq.question,
                    answer: faq.answer,
                    order: faq.order || 0,
                    faq_category_id: faq.faq_category_id,
                });
            } else {
                reset();
                setData('faq_category_id', categoryId);
            }
        }
    }, [faq, categoryId, isOpen]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const routeName = faq ? route('admin.faqs.update', faq.id) : route('admin.faqs.store');
        const method = faq ? put : post;
        method(routeName, {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px] bg-white">
                <DialogHeader>
                    <DialogTitle>{faq ? 'Editar Pregunta' : 'Crear Pregunta'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="question">Pregunta</Label>
                            <Textarea id="question" value={data.question} onChange={e => setData('question', e.target.value)} className="mt-1" />
                            {errors.question && <p className="text-sm text-red-600 mt-1">{errors.question}</p>}
                        </div>
                        <div>
                            <Label htmlFor="answer">Respuesta</Label>
                            <Textarea id="answer" value={data.answer} onChange={e => setData('answer', e.target.value)} className="mt-1" rows={5} />
                            {errors.answer && <p className="text-sm text-red-600 mt-1">{errors.answer}</p>}
                        </div>
                        <div>
                            <Label htmlFor="order">Orden</Label>
                            <Input id="order" type="number" value={data.order} onChange={e => setData('order', parseInt(e.target.value))} className="mt-1" />
                            {errors.order && <p className="text-sm text-red-600 mt-1">{errors.order}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}