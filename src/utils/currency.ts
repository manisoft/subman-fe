// Utility for currency conversion and formatting
const powerfulCurrencies = [
    'USD', 'CAD', 'EUR', 'GBP', 'AUD', 'CHF', 'SGD', 'NZD', 'SEK', 'NOK', 'DKK', 'HKD'
];
const currencySymbols: Record<string, string> = {
    USD: '$', CAD: '$', EUR: '€', GBP: '£', AUD: '$', CHF: '₣', JPY: '¥', CNY: '¥', INR: '₹',
    KRW: '₩', RUB: '₽', BRL: 'R$', MXN: '$', ZAR: 'R', TRY: '₺', IRR: '﷼', VND: '₫',
    // ...add more as needed
};

export function getCurrencySymbol(code: string) {
    return currencySymbols[code] || code;
}

export function convertPrice(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>
): number {
    if (from === to) return amount;
    if (!rates[from] || !rates[to]) return amount;
    // Convert to USD, then to target
    const usd = amount / rates[from];
    return usd * rates[to];
}

export function formatPrice(
    amount: number,
    code: string
): string {
    const symbol = getCurrencySymbol(code);
    const decimals = powerfulCurrencies.includes(code) ? 2 : 0;
    return `${symbol}${amount.toFixed(decimals)}`;
}
