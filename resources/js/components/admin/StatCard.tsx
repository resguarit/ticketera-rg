import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currencyHelpers';
import { StatCardProps, STAT_CARD_VARIANTS } from '@/types/admin';

export function StatCard({ title, value, icon: Icon, variant, format = 'number' }: StatCardProps) {
  const formatValue = (val: string | number): string => {
    const numValue = typeof val === 'string' ? parseFloat(val) || 0 : val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(numValue);
      case 'percentage':
        return `${numValue}%`;
      case 'number':
      default:
        return numValue.toLocaleString();
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-black">{formatValue(value)}</p>
          </div>
          <div className={`w-12 h-12 ${STAT_CARD_VARIANTS[variant]} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
