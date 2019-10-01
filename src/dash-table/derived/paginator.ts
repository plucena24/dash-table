import { memoizeOneFactory } from 'core/memoizer';

import { clearSelection } from 'dash-table/utils/actions';

import {
    Data,
    SetProps,
    TableAction
} from 'dash-table/components/Table/props';

export interface IPaginator {
    loadNext(): void;
    loadPrevious(): void;
    loadFirst(): void;
    loadLast(): void;
    lastPage: number | undefined;
    goToPage(page: number): void;
    hasPrevious(): boolean;
    hasNext(): boolean;
    hasLast(): boolean;
}

export function lastPage(data: Data, page_size: number) {
    return Math.max(Math.ceil(data.length / page_size) - 1, 0);
}

export function loadPrevious(page_current: number, setProps: SetProps) {
    if (page_current <= 0) {
        return;
    }

    page_current--;
    setProps({ page_current, ...clearSelection });
}

export function loadFirst(page_current: number, setProps: SetProps) {
    page_current = 0;
    setProps({ page_current, ...clearSelection });
}

export function hasPrevious(page_current: number) {
    return (page_current !== 0);
}

function getBackEndPagination(
    page_current: number,
    setProps: SetProps,
    page_count: number | undefined
): IPaginator {

    // adjust for zero-indexing
    if (page_count) {
        page_count = Math.max(0, page_count - 1);
    }

    return {
        loadNext: () => {
            page_current++;
            setProps({ page_current, ...clearSelection });
        },
        loadPrevious: () => loadPrevious(page_current, setProps),
        loadFirst: () => loadFirst(page_current, setProps),
        loadLast: () => {
            if (page_count) {
                page_current = page_count;
                setProps({ page_current, ...clearSelection });
            }
        },
        lastPage: page_count,
        goToPage: (page: number) => {

            // adjust for zero-indexing
            page--;

            page_current = page;

            if (page < 0) {
                page_current = 0;
            }

            if (page_count && page > page_count) {
                page_current = page_count;
            }

            setProps({ page_current, ...clearSelection });
        },
        hasPrevious: () => hasPrevious(page_current),
        hasNext: () => {
            return page_count === undefined || page_current !== page_count;
        },
        hasLast: () => {
            return !page_count ? false : page_current !== page_count;
        }
    };
}

function getFrontEndPagination(
    page_current: number,
    page_size: number,
    setProps: SetProps,
    data: Data
) {
    return {
        loadNext: () => {
            const maxPageIndex = lastPage(data, page_size);

            if (page_current >= maxPageIndex) {
                return;
            }

            page_current++;
            setProps({ page_current, ...clearSelection });
        },
        loadPrevious: () => loadPrevious(page_current, setProps),
        loadFirst: () => loadFirst(page_current, setProps),
        loadLast: () => {
            page_current = lastPage(data, page_size);
            setProps({ page_current, ...clearSelection });
        },
        lastPage: lastPage(data, page_size),
        goToPage: (page: number) => {

            page--;

            page_current = page;

            if (page < 0) {
                page_current = 0;
            }

            if (page > lastPage(data, page_size)) {
                page_current = lastPage(data, page_size);
            }

            setProps({ page_current, ...clearSelection });
        },
        hasPrevious: () => hasPrevious(page_current),
        hasNext: () => {
            return (page_current !== lastPage(data, page_size));
        },
        hasLast: () => {
            return (page_current !== lastPage(data, page_size));
        }
    };
}

function getNoPagination() {
    return {
        loadNext: () => { },
        loadPrevious: () => { },
        loadFirst: () => { },
        loadLast: () => { },
        lastPage: 0,
        goToPage: () => { },
        hasPrevious: () => false,
        hasNext: () => false,
        hasLast: () => false
    };
}

const getter = (
    page_action: TableAction,
    page_current: number,
    page_size: number,
    page_count: number | undefined,
    setProps: SetProps,
    data: Data
): IPaginator => {
    switch (page_action) {
        case TableAction.None:
            return getNoPagination();
        case TableAction.Native:
            return getFrontEndPagination(page_current, page_size, setProps, data);
        case TableAction.Custom:
            return getBackEndPagination(page_current, setProps, page_count);
        default:
            throw new Error(`Unknown pagination mode: '${page_action}'`);
    }
};

export default memoizeOneFactory(getter);
