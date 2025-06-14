export default function getConfig(value: string): string | undefined {
    return (window as any)[value] || (import.meta.env as any)[value]
}