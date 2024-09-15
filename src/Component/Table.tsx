import React, { useEffect, useRef, useState } from 'react';
import { DataTable, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';

interface ArtworkData {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const Table: React.FC = () => {
  const totalRecords = 126079; // Total records count from API
  const [page, setPage] = useState<number>(1); // Track current page
  const [selectedRows, setSelectedRows] = useState<ArtworkData[]>([]); 
  const [data, setData] = useState<ArtworkData[]>([]); 
  const [rowsToSelect, setRowsToSelect] = useState<number>(0); 
  const rowsPerPage = 12; 

  const fetchPage = async (pageNumber: number) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    };

    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=${rowsPerPage}`, options);
      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Fetch data for the current page
  useEffect(() => {
    fetchPage(page).then((fetchedData) => {
      setData(fetchedData);
    });
  }, [page]);

  // Handle selecting rows across multiple pages
  const handleSelectRows = async () => {
    let totalSelected = 0;
    const selectedArtworks: ArtworkData[] = selectedRows;
    let currentPage = 1; // Start from the first page

    while (totalSelected < rowsToSelect) {
      const pageData = await fetchPage(currentPage);
      
      for (const row of pageData) {
        if (totalSelected < rowsToSelect) {
          selectedArtworks.push(row);
          totalSelected++;
        } else {
          break;
        }
      }

      if (pageData.length < rowsPerPage || totalSelected >= rowsToSelect) {
        break;
      }
      currentPage++;
    }

    setSelectedRows(selectedArtworks);
    setPage(1); // Reset to the first page after selection
    fetchPage(1).then((fetchedData) => {
      setData(fetchedData);
    });
  };

  // Handle input change for number of rows to select
  const handleRowsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    if (!isNaN(count)) {
      setRowsToSelect(count);
    }
  };

  const op = useRef<OverlayPanel>(null);

  const onRowClick = (event: any) => {
    const clickedRow = event.data;
    const newSelection = selectedRows.some(row => row.id === clickedRow.id)
      ? selectedRows.filter(row => row.id !== clickedRow.id)
      : [...selectedRows, clickedRow];
    setSelectedRows(newSelection);
  };

  return (
    <div className="card">
      <div className="card flex justify-center">
        <Button
          type="button"
          icon="pi pi-image"
          className="bg-slate-300 p-3"
          label="v"
          onClick={(e) => op.current?.toggle(e)}
        />
        <OverlayPanel ref={op}>
          <input
            type="text"
            onChange={handleRowsInputChange}
            placeholder="Enter Rows"
            className="p-2 border-black"
          />
          <Button label="Select" onClick={handleSelectRows} className="bg-slate-400 p-1 m-1" />
        </OverlayPanel>
      </div>

      <DataTable
        className='bg-gray-100 px-4 py-4 text-left rounded'
        value={data}
        selection={selectedRows}
        onSelectionChange={(e: DataTableSelectionMultipleChangeEvent<ArtworkData[]>) => setSelectedRows(e.value)}
        dataKey="id"
        selectionMode="multiple"
        metaKeySelection={false}
        onRowClick={onRowClick}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} className='text-left' />
        <Column field="title" header="Title" sortable  />
        <Column field="place_of_origin" header="Place of Origin" sortable className='py-2' />
        <Column field="artist_display" header="Artist Display" sortable />
        <Column field="date_start" header="Date Start" sortable />
        <Column field="date_end" header="Date End" sortable />
      </DataTable>

      <div className="pagination my-10 cursor-pointer bg-gray-200 p-2 w-fit mx-auto">
        <span className={page === 1 ? 'hidden' : 'px-4'} onClick={() => setPage(1)}>
        ⬅️⬅️
        </span>
        <span className={page === 1 ? 'hidden' : 'px-2'} onClick={() => setPage(page - 1)}>
        ⬅️
        </span>
      
        <span className="">
          {page} 
        </span>
        
        <span
          className={page === Math.ceil(totalRecords / rowsPerPage) ? 'hidden' : ' px-2'}
          onClick={() => setPage(page + 1)}
        >
          ➡️
        </span>
        <span
          className={page === Math.ceil(totalRecords / rowsPerPage) ? 'hidden' : 'px-4'}
          onClick={() => setPage(Math.ceil(totalRecords / rowsPerPage))}
        >
          ➡️➡️
        </span>
      </div>
    </div>
  );
};

export default Table;