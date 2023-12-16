import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import React from "react";

type DropdownSelectProps<
  T extends string | number | readonly string[] | undefined
> = {
  handleSortByChange: (event: SelectChangeEvent<T>) => void;
  sortBy: T;
  values: T[];
  labels: string[];
};

function DropdownSelect<
  T extends string | number | readonly string[] | undefined
>({ sortBy, handleSortByChange, values, labels }: DropdownSelectProps<T>) {
  return (
    <FormControl sx={{ m: 1, minWidth: 130 }} size="small">
      <InputLabel id="demo-select-small-label">Sắp xếp</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={sortBy}
        label="Sắp xếp"
        onChange={handleSortByChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 20 * 4.5 + 8,
              width: 250,
            },
          },
        }}
      >
        {values.map((v, i) => (
          <MenuItem key={v as string} value={v}>
            {labels[i]}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default DropdownSelect;
