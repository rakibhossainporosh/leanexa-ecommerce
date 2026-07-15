import { useCallback, useEffect, useRef, useState } from 'react';

export type DataTableColumn = {
    data: string;
    name: string;
    searchable: boolean;
    orderable: boolean;
};

/**
 * Client for a yajra/laravel-datatables server-side endpoint: builds the
 * DataTables request protocol and manages search/sort/pagination state.
 */
export function useDataTable(
    url: string,
    columns: DataTableColumn[],
    defaultOrder: { col: number; dir: 'asc' | 'desc' } = {
        col: 0,
        dir: 'desc',
    },
) {
    const [rows, setRows] = useState<any[]>([]);
    const [recordsTotal, setRecordsTotal] = useState(0);
    const [recordsFiltered, setRecordsFiltered] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearchState] = useState('');
    const [page, setPage] = useState(0);
    const [perPage, setPerPageState] = useState(10);
    const [order, setOrder] = useState(defaultOrder);
    const drawRef = useRef(0);

    const reload = useCallback(async () => {
        setLoading(true);
        const draw = ++drawRef.current;

        const params = new URLSearchParams();
        params.set('draw', String(draw));
        params.set('start', String(page * perPage));
        params.set('length', String(perPage));
        params.set('search[value]', search);
        params.set('search[regex]', 'false');
        params.set('order[0][column]', String(order.col));
        params.set('order[0][dir]', order.dir);
        columns.forEach((c, i) => {
            params.set(`columns[${i}][data]`, c.data);
            params.set(`columns[${i}][name]`, c.name);
            params.set(`columns[${i}][searchable]`, String(c.searchable));
            params.set(`columns[${i}][orderable]`, String(c.orderable));
            params.set(`columns[${i}][search][value]`, '');
            params.set(`columns[${i}][search][regex]`, 'false');
        });

        try {
            const res = await fetch(`${url}?${params.toString()}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });

            if (!res.ok) {
                return;
            }

            const json = await res.json();

            // Ignore out-of-order responses from rapid typing.
            if (Number(json.draw) !== drawRef.current) {
                return;
            }

            setRows(json.data ?? []);
            setRecordsTotal(json.recordsTotal ?? 0);
            setRecordsFiltered(json.recordsFiltered ?? 0);
        } finally {
            if (draw === drawRef.current) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, page, perPage, search, order]);

    // Debounce while typing; near-instant for everything else.
    useEffect(() => {
        const t = setTimeout(reload, 250);

        return () => clearTimeout(t);
    }, [reload]);

    const setSearch = (value: string) => {
        setSearchState(value);
        setPage(0);
    };

    const setPerPage = (value: number) => {
        setPerPageState(value);
        setPage(0);
    };

    const toggleSort = (col: number) => {
        setPage(0);
        setOrder((o) =>
            o.col === col
                ? { col, dir: o.dir === 'asc' ? 'desc' : 'asc' }
                : { col, dir: 'asc' },
        );
    };

    const lastPage = Math.max(0, Math.ceil(recordsFiltered / perPage) - 1);
    const from = recordsFiltered === 0 ? 0 : page * perPage + 1;
    const to = Math.min((page + 1) * perPage, recordsFiltered);

    return {
        rows,
        recordsTotal,
        recordsFiltered,
        loading,
        search,
        setSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        order,
        toggleSort,
        reload,
        lastPage,
        from,
        to,
    };
}
