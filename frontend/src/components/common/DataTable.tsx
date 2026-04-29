'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column {
  key: string;
  header: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
}

export function DataTable({ data, columns }: DataTableProps) {
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : ''), obj);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.key}>{getValue(row, col.key)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}