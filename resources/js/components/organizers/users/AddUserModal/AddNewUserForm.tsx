import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewUserValues { name: string; last_name: string; dni: string; phone: string; address: string; email: string }

interface Props {
  values: NewUserValues;
  setValues(v: NewUserValues): void;
  errors: Record<string, string>;
}

export function AddNewUserForm({ values, setValues, errors }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input value={values.name} onChange={e => setValues({ ...values, name: e.target.value })} required />
        {errors['person.name'] && <p className="text-xs text-destructive">{errors['person.name']}</p>}
      </div>
      <div className="space-y-2">
        <Label>Apellido</Label>
        <Input value={values.last_name} onChange={e => setValues({ ...values, last_name: e.target.value })} required />
        {errors['person.last_name'] && <p className="text-xs text-destructive">{errors['person.last_name']}</p>}
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={values.email} onChange={e => setValues({ ...values, email: e.target.value })} required />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label>DNI</Label>
        <Input value={values.dni} onChange={e => setValues({ ...values, dni: e.target.value })} />
        {errors['person.dni'] && <p className="text-xs text-destructive">{errors['person.dni']}</p>}
      </div>
      <div className="space-y-2">
        <Label>Teléfono</Label>
        <Input value={values.phone} onChange={e => setValues({ ...values, phone: e.target.value })} />
        {errors['person.phone'] && <p className="text-xs text-destructive">{errors['person.phone']}</p>}
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Dirección</Label>
        <Input value={values.address} onChange={e => setValues({ ...values, address: e.target.value })} />
        {errors['person.address'] && <p className="text-xs text-destructive">{errors['person.address']}</p>}
      </div>
      <div className="md:col-span-2 text-xs text-muted-foreground">La contraseña se generará automáticamente.</div>
    </div>
  );
}

export default AddNewUserForm;
