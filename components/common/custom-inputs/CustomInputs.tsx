import { OtherPros } from "@/utils/interface";
import {
  Checkbox,
  FormControlLabel,
  Radio,
  TextField,
  TextFieldProps,
} from "@mui/material";

interface FormInputProps {
  label: string;
  type: "checkbox" | "radio";
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  checked,
  onChange,
}) => {
  return (
    <FormControlLabel
      control={
        type === "checkbox" ? (
          <Checkbox
            sx={{ color: "#15191e" }}
            checked={checked}
            onChange={onChange}
            name={name}
            value={label}
          />
        ) : (
          <Radio
            sx={{ color: "#15191e" }}
            checked={checked}
            onChange={onChange}
            name={name}
            value={label}
          />
        )
      }
      label={label}
    />
  );
};

export function CustomInput(props: TextFieldProps & OtherPros) {
  const { id, className = "", select, sx, ...rest } = props;

  return (
    <TextField
      name={id}
      label={props.label}
      variant="outlined"
      className={className}
      fullWidth
      margin="normal"
      select={select}
      sx={{
        ...sx,
        "& .MuiInputBase-root": {
          height: select ? "48px" : undefined,
          padding: select ? "10px 14px" : undefined,
        },
        "& .MuiOutlinedInput-input": {
          padding: select ? "10px 14px" : undefined,
        },
        "& .MuiInputBase-input": {
          color: "#000",
        },
        "& label": {
          color: "#000 !important",
        },
        "& .MuiOutlinedInput-root": {
          border: "1px solid #82aac552",
        },
      }}
      {...rest}
    />
  );
}
