export default function PaginationControls({ page, totalPages, totalItems, pageSize, onPageChange, itemLabel = 'elementos' }) {
    if (totalItems === 0 || totalPages <= 1) {
        return null;
    }

    const showRange = typeof totalItems === 'number' && typeof pageSize === 'number';
    const startItem = showRange ? ((page - 1) * pageSize) + 1 : null;
    const endItem = showRange ? Math.min(totalItems, page * pageSize) : null;

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-zinc-400">
                {showRange ? `Mostrando ${startItem}-${endItem} de ${totalItems} ${itemLabel}` : `Página ${page} de ${totalPages}`}
            </p>
            <div className="flex items-center gap-3">
                {showRange ? <p className="text-sm text-zinc-400">Página {page} de {totalPages}</p> : null}
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Anterior
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}