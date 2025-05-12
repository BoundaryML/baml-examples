export default function apiPath(path:string): string {
    if (process.env.NODE_ENV === "development") {
        return `http://localhost:8000${path}`;
    }
    return `${path}`;
}