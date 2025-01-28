"use client";
import ResponsiveAppBar from "@/components/common/navbar";
import PrivateRoute from "@/components/common/private-route/PrivateRoute";
import LocationSearchInput from "@/components/home/auto-complete";
import SolarReport from "@/components/home/report";
import { callPostApi } from "@/utils/api";
import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
  const [solarData, setSolarData] = useState<any | null>(null);
  const [state, setState] = useState({
    address: "",
    lat: null as number | null,
    lng: null as number | null,
    panoId: null as string | null,
  });
  const [loading, setLoading] = useState(false);

  const getDetails = (lat: number, lng: number) => {
    setLoading(true);
    callPostApi(
      "api/find-closet",
      {
        latitude: lat,
        longitude: lng,
      },
      (e) => {
        setSolarData(e);
        setLoading(false);
      }
    );
  };

  // const handleNewAddress = (newAddressData: any) => {
  //   setState((prevState) => {
  //     const newState = {
  //       ...prevState,
  //       address: newAddressData.address || "",
  //       lat: newAddressData.lat || prevState.lat,
  //       lng: newAddressData.lng || prevState.lng,
  //       panoId: null,
  //     };
  //     return newState;
  //   });
  //   setSolarData(null); // Reset solarData when clearing input
  // };

  useEffect(() => {
    if (state.lat != null && state.lng != null) {
      getDetails(state.lat, state.lng);
    }
  }, [state.lat, state.lng]);
//
  return (
    <div>
          <PrivateRoute> <ResponsiveAppBar /> </PrivateRoute>
      <Box className="flex flex-col md:items-center">
        <Box className="max-md:w-full w-2/3">
          <LocationSearchInput setSearch={setState} setSolarData={setSolarData} />
        </Box>

        {loading ? (
          <Box mt={4} display={"flex"} justifyContent={"center"}>
            <CircularProgress />
          </Box>
        ) : (
          solarData !== null && <SolarReport solarData={solarData} state={state} />
        )}
      </Box>
    </div>
  );
}
