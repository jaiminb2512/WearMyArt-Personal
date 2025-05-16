import React, { useEffect, useState } from "react";
import ApiURLS from "../Data/ApiURLS";
import { useFetchData, useApiMutation } from "../utils/apiRequest";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import MTooltipButton from "../Components/MTooltipButton";

const CustomizationOptions = () => {
  const { data: customizationOptions, isLoading } = useFetchData(
    "CustomizationOptions",
    ApiURLS.GetCustomizationOptions.url,
    ApiURLS.GetCustomizationOptions.method,
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const [localOptions, setLocalOptions] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [newOption, setNewOption] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addType, setAddType] = useState("fontOptions");

  const deleteMutation = useApiMutation(
    ApiURLS.DeleteCustomizationOptions.url,
    ApiURLS.DeleteCustomizationOptions.method
  );

  const addMutation = useApiMutation(
    ApiURLS.AddCustomizationOptions.url,
    ApiURLS.AddCustomizationOptions.method
  );

  useEffect(() => {
    if (customizationOptions) {
      setLocalOptions(customizationOptions);
    }
  }, [customizationOptions]);

  if (isLoading) {
    return <div className="p-4 ml-[3vw]">Loading...</div>;
  }

  if (!localOptions) {
    return <div>No data available</div>;
  }

  const { fontOptions, textStyles } = localOptions;

  const handleDelete = async () => {
    if (!selectedItem || !selectedType) return;

    try {
      await deleteMutation.mutateAsync({ [selectedType]: [selectedItem] });
      setLocalOptions((prevOptions) => {
        const updatedOptions = { ...prevOptions };
        delete updatedOptions[selectedType][selectedItem];
        return updatedOptions;
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error deleting option:", error);
    }
  };

  const handleAddOption = async () => {
    if (!newOption || !newPrice) return;

    try {
      await addMutation.mutateAsync({
        [addType]: { [newOption]: Number(newPrice) },
      });
      setLocalOptions((prevOptions) => ({
        ...prevOptions,
        [addType]: { ...prevOptions[addType], [newOption]: Number(newPrice) },
      }));
      setOpenAddDialog(false);
      setNewOption("");
      setNewPrice("");
    } catch (error) {
      console.error("Error adding option:", error);
    }
  };

  const openDeleteDialog = (key, type) => {
    setSelectedItem(key);
    setSelectedType(type);
    setOpenDialog(true);
  };

  const renderTable = (data, title, type) => (
    <TableContainer component={Paper} className="mb-6 p-4">
      <div className="flex justify-between items-center flex-wrap">
        <h3 className="text-xl font-semibold">{title}</h3>
        <MTooltipButton
          startIcon={<Add />}
          color="success"
          variant="outlined"
          title="Add Option"
          onClick={() => setOpenAddDialog(true)}
        >
          Add Option
        </MTooltipButton>
      </div>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
            <TableCell>Price (INR)</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {Object?.entries(data)?.map(([key, price]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>₹{price}</TableCell>
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => openDeleteDialog(key, type)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="p-4 ml-[3vw]">
      <h2 className="text-2xl font-bold mb-4">Customization Options</h2>
      <div className="flex flex-col md:flex-row gap-3">
        {renderTable(fontOptions, "Font Options", "fontOptions")}
        {renderTable(textStyles, "Text Styles", "textStyles")}
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{selectedItem}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MTooltipButton title="Cancel" onClick={() => setOpenDialog(false)}>
            Cancel
          </MTooltipButton>
          <MTooltipButton title="Delete" color="error" onClick={handleDelete}>
            Delete
          </MTooltipButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Option</DialogTitle>
        <DialogContent className="flex flex-col gap-4 w-[350px] mt-3 h-fit">
          <TextField
            label="Option Name"
            fullWidth
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
          />
          <TextField
            label="Price (INR)"
            type="number"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddOption} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomizationOptions;
