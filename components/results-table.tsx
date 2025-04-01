"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ResultsTableProps {
  data: any[]
}

export default function ResultsTable({ data }: ResultsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Saldo Devedor</TableHead>
              <TableHead>Amortização</TableHead>
              <TableHead>Juros</TableHead>
              <TableHead>Parcela</TableHead>
              <TableHead>Amort. Extra</TableHead>
              <TableHead>Parcelas Restantes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.Mês}</TableCell>
                <TableCell>{formatCurrency(Number(item["Saldo devedor"]))}</TableCell>
                <TableCell>{formatCurrency(Number(item.Amortização))}</TableCell>
                <TableCell>{formatCurrency(Number(item.Juros))}</TableCell>
                <TableCell>{formatCurrency(Number(item.Parcela))}</TableCell>
                <TableCell>{formatCurrency(Number(item["Amortização Ext."]))}</TableCell>
                <TableCell>{item["Parcelas restantes"]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} parcelas
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
        </div>
      </div>
    </div>
  )
}