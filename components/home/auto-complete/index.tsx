import { CustomInput } from "@/components/common/custom-inputs/CustomInputs";
import PrivateRoute from "@/components/common/private-route/PrivateRoute";
import { getGoogleMapsUrl } from "@/function";
import ClearIcon from "@mui/icons-material/Clear";

import {
  Autocomplete,
  CircularProgress,
  IconButton,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import PlacesAutocomplete, {
  Suggestion,
  geocodeByAddress,
} from "react-places-autocomplete";

interface LocationSearchInputProps {
  setSearch: any;
  setSolarData:any
}
const searchOptions = {
  componentRestrictions: {
    country: ["us", "ca", "de"],
  },
};

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  setSearch,
  setSolarData
}) => {
  const [address, setAddress] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const selectRef = useRef<boolean>(false);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const checkScriptLoaded = () => {
      if (window.google && window.google.maps) {
        setIsScriptLoaded(true);
      }
    };
    checkScriptLoaded();
    window.addEventListener("load", checkScriptLoaded);

    return () => {
      window.removeEventListener("load", checkScriptLoaded);
    };
  }, []);

  const handleChange = (address: string) => {
    setAddress(address);
  };

  const handleSelect = (address: string) => {
    setAddress(address);
    setOpen(false);
    selectRef.current = true;
    geocodeByAddress(address)
      .then(async (results: any) => {
        const selectedAddress = results[0];
        const lat = results[0]?.geometry?.location.lat();
        const lng = results[0]?.geometry?.location.lng();
        const streetViewUrl = getGoogleMapsUrl(lat, lng);
        setSearch({
          address: selectedAddress.formatted_address,
          streetViewUrl,
          lat,
          lng,
        });
      })
      .catch((error) => console.error("Error", error));
  };

  const handleClear = () => {
    setAddress("");
    setSearch("");
    setSolarData(null)
  };

  return (
    <PrivateRoute>
    <PlacesAutocomplete
      value={address}
      onChange={handleChange}
      onSelect={handleSelect}
      highlightFirstSuggestion
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
        const displaySuggestions = suggestions.length > 0 ? suggestions : [];

        return (
          <Autocomplete
            options={displaySuggestions}
            getOptionLabel={(suggestion: Suggestion) => suggestion.description}
            // loading={loading}
            fullWidth
            inputValue={address}
            sx={{
              "& button.MuiButtonBase-root": {
                visibility: "visible",
                color: "black",
              },
              
            }}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => {
              if (!selectRef.current) {
                setOpen(false);
              }
              selectRef.current = false;
            }}
            onInputChange={(event, newInputValue) => {
              if (newInputValue !== "") {
                handleChange(newInputValue);
              }
            }}
            renderInput={(params) => (
              <CustomInput
                {...params}
                {...getInputProps({
                  placeholder: "Enter an address, city, or Zip Code",
                })}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress sx={{ color: "#000" }} size={20} />
                      ) : null}
                      {address && (
                        <IconButton onClick={handleClear}>
                          <ClearIcon sx={{ color: "#000" }} />
                        </IconButton>
                      )}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            renderOption={(props, suggestion, index) => {
              const { className, style, ...rest } = getSuggestionItemProps(
                suggestion,
                {
                  className: suggestion.active
                    ? "suggestion-item--active"
                    : "suggestion-item",
                  style: suggestion.active
                    ? { backgroundColor: "#fafafa", cursor: "pointer" }
                    : { backgroundColor: "#ffffff", cursor: "pointer" },
                }
              );

              return (
                <MenuItem
                  {...props}
                  {...rest}
                  className={className}
                  style={style}
                  onClick={() => {
                    handleSelect(suggestion.description);
                  }}
                >
                  <span>{suggestion.description}</span>
                </MenuItem>
              );
            }}
          />
        );
      }}
    </PlacesAutocomplete>
    </PrivateRoute>
  );
};

export default LocationSearchInput;
