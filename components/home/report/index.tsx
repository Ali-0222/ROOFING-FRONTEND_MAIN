"use client";
import { Box, Button, Checkbox, CircularProgress, FormControl, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
interface SubscriptionData {
  active: boolean;
  subscription?: any;
  paymentIntentId?: any,
  message: string;
  customerId?: any,
}
interface RoofType {
  id: string | number;
  roofType: string;
  additionalFee: number;

}
type WasteTier = {
  id: string;
  roofType: string;
  wasteTier: number;
};
interface Material {
  additionalFee: any;
  materialCost: any;
  id: string;
  name: string;
  cost: number;
}
const SolarReport = ({ solarData, state  }: any) => {
  const reportRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [remainingDownloads, setRemainingDownloads] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionData>({
    active: false,
    message: '',
    subscription: null,
    paymentIntentId: null,
    customerId: null,
  });
  const [roofTypes, setRoofTypes] = useState<RoofType[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedRoofType, setSelectedRoofType] = useState<string>("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [data, setData] = useState<any>(null); 
  const [wasteTiers, setWasteTiers] = useState<WasteTier[]>([]); // ensure it's an array of WasteTier objects
  const [currentWasteTier, setCurrentWasteTier] = useState("");

  // useEffect(() => {
  //   axios
  //     .get("/api/roofTypes")
  //     .then((response) => setRoofTypes(response.data.data))
  //     .catch((error) => console.error("Error fetching roof types:", error));
  // }, []);

  // Fetch waste tiers
  // useEffect(() => {
  //   axios
  //     .get("/api/waste-tiers")
  //     .then((response) => setWasteTiers(response.data.data))
  //     .catch((error) => console.error("Error fetching waste tiers:", error));
  // }, []);

  // useEffect(() => {
  //   if (selectedRoofType) {
  //     const matchedWasteTier = wasteTiers.find(
  //       (tier) => tier.roofType === selectedRoofType
  //     );
  //     const updatedWasteTier = matchedWasteTier ? String(matchedWasteTier.wasteTier) : "0";
  //     setCurrentWasteTier(updatedWasteTier);
  //     console.log("Updated waste tier:", updatedWasteTier);  // Debugging log
  //   } else {
  //     setCurrentWasteTier("");
  //   }
  // }, [selectedRoofType, wasteTiers]);
  
  
  
  useEffect(() => {
    const fetchRoofTypes = async () => {
      try {
        const response = await fetch("/api/roofTypes");
        if (!response.ok) {
          throw new Error("Failed to fetch roof types");
        }
        const result = await response.json();
        
        if (result.success && result.data) {
          setRoofTypes(result.data);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (error) {
      }
    };
  
    fetchRoofTypes();
  }, []);
  const getMaterialWithFee = (roofTypeName: string, materials: Material[]) => {
    const roofType = roofTypes.find((type) => type.roofType === roofTypeName);
    if (roofType) {
      return materials.map((material) => ({
        ...material,
        additionalFee: roofType.additionalFee,
      }));
    }
    return materials;
  };

  const fetchData = async () => {
    const email = localStorage.getItem('email'); 

    if (!email) {
      setData([]);
      return;
    }

    try {
      const response = await fetch(`/api/client-data?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setData(result.data || []);
      } else {
        setData([]);
      }
    } catch (error: any) {
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials');
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        const result = await response.json();
  
        if (result.success && result.data) {
          const flatMaterials = result.data
            .map((roof: { materials: any; }) => roof.materials)
            .flat()
            .reduce((uniqueMaterials: any[], material: { id: any; }) => {
              if (!uniqueMaterials.some((m) => m.id === material.id)) {
                uniqueMaterials.push(material);
              }
              return uniqueMaterials;
            }, []);
          setMaterials(flatMaterials);
        } else {
          throw new Error('Invalid data structure');
        }
      } catch (error) {
      }
    };
  
    fetchMaterials();
  }, []);
  
  const handleMaterialChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedMaterials(event.target.value as string[]);
  };
  const selectedMaterialNames = selectedMaterials
    .map((id) => materials.find((material) => material.id === id)?.name)
    .filter(Boolean)
    .join(', ');
    const handleSubmit = async () => {
      if (!selectedRoofType || selectedMaterials.length === 0) {
        toast.error('Please select a roof type and materials');
        return;
      }
      // const selectedRoofTypeName = roofTypes.find((roof) => roof.id === selectedRoofType)?.name;
      const email = localStorage.getItem("email");
      const payload = {
        // roofType: selectedRoofTypeName || 'clay',
        materials: selectedMaterials.map((id) => {
          const material = materials.find((m) => m.id === id);
          return material ? { name: material.name, cost: material.cost } : null;
        }).filter(Boolean),
        email: email
      };
  
      try {
        const response = await fetch('/api/client-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          
        });
        fetchData();
        if (!response.ok) {
          fetchData();
          throw new Error('Failed to submit data');
        }
  
        const data = await response.json();
        toast.success('Data submitted successfully!');
      } catch (error) {
        toast.error('Failed to submit data');
      }
    };
  const fetchRemainingDownloads = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/freeDownloads/getFree?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setRemainingDownloads(data.freeDownloads);
      }
    } catch (error) {
      toast.error('There was an error fetching the data after downloading the PDF.');
    }finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const email = localStorage.getItem("email");

    if (email) {
      fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.active) {
            setSubscriptionStatus({
              active: true,
              subscription: data.subscription,
              message: "Subscription is active.",
            });

            return fetch("/api/auth/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                subscribe: true,
                paymentIntentId: data.paymentIntentId,
                customerId: data.customerId,
              }),
            });
          } else {
            setSubscriptionStatus({
              active: false,
              message: data.message || "No active subscription.",
            });

            return fetch("/api/auth/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                subscribe: false,
                paymentIntentId: null,
                customerId: null,
              }),
            });
          }
        })
        .then((res) => res?.json())
        .then((signupResponse) => {
        })
        .catch((err) => {
          setSubscriptionStatus({
            active: false,
            message: "Error fetching subscription status.",
          });
        })
        .finally(() => {
        });
    } else {
      setSubscriptionStatus({
        active: false,
        message: "Email not found in local storage.",
      });
    }
  }, []);


  const handlePayment = async () => {
    setIsLoading(true);
  
    try {
      window.location.href = "https://buy.stripe.com/dR6bM883VfsTbbWeUU";
    } catch (error) {
      toast.error("Error redirecting to payment page.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const checkImagesLoaded = () => {
    const images = document.querySelectorAll("img");
    let loaded = true;
    images.forEach((img) => {
      if (!img.complete) loaded = false;
    });
    setImagesLoaded(loaded);
  };

  useEffect(() => {
    checkImagesLoaded();
  }, [state]);
  const SubscribeGeneratePdf = async () => {
    const report = reportRef.current;
  
    if (report && imagesLoaded) {
      setIsGeneratingPdf(true);
  
      try {
        const email = localStorage.getItem("email");
  
        if (email) {
          const subscriptionResponse = await fetch("/api/check-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
  
          const subscriptionData = await subscriptionResponse.json();
  
          if (subscriptionData.active) {
            setSubscriptionStatus({
              active: true,
              subscription: subscriptionData.subscription,
              message: "Subscription is active.",
            });
  
            const amount = subscriptionData.amount; 
            const currency = subscriptionData.currency;
  
            const requestData = {
              customerId: subscriptionData.customerId, 
              email: email,
              paymentIntentId: subscriptionData.paymentIntentId,
              amount: amount,
              currency: currency,
              paymentMethodId: subscriptionData.paymentMethodId,
            };
  
            const paymentResponse = await fetch("/api/re-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });
  
            const paymentResult = await paymentResponse.json();
  
            if (!paymentResponse.ok) {
              throw new Error(paymentResult.error || "Payment API call failed.");
            }
  
            if (paymentResult.error && paymentResult.error.type === "card_error") {
              const declineCode = paymentResult.error.decline_code;
  
              if (declineCode === "insufficient_funds") {
                toast.error(
                  <>
                    <p>Payment failed due to insufficient funds.</p>
                    <a href="https://buy.stripe.com/dR6bM883VfsTbbWeUU" target="_blank" rel="noopener noreferrer">
                      Click here to update your payment method.
                    </a>
                  </>
                );
                return;
              }
            }
            if (paymentResult.success === false) {
              toast.error(
                <>
                  <p>Please change your payment method. This one is not working.</p>
                  <a href="https://buy.stripe.com/dR6bM883VfsTbbWeUU" target="_blank" rel="noopener noreferrer">
                    Click here to change your payment method.
                  </a>
                </>
              );
              return;
            }
              const canvas = await html2canvas(report, {
              useCORS: true,
              allowTaint: false,
              logging: true,
              scale: 2,
            });
  
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
  
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
  
            let position = 0;
  
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
  
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }
  
            pdf.save("solar_report.pdf");
          } else {
            setSubscriptionStatus({
              active: false,
              message: subscriptionData.message || "No active subscription.",
            });
          }
        }
      } catch (error) {
        toast.error("Error generating the PDF. Please try again.");
      } finally {
        setIsGeneratingPdf(false);
      }
    } else {
      toast.warn("Please wait for images to load before generating the PDF.");
    }
  };
  
  const generatePdf = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
        toast.error("User email is missing. Please log in again.");
        return;
    }
    setIsGeneratingPdf(true);

    try {
        const response = await fetch("/api/freeDownloads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error(data.error || "An error occurred while validating free downloads.");
            return;
        }
        fetchRemainingDownloads(email);

        const remainingDownloads = data.remainingDownloads;
        setRemainingDownloads(remainingDownloads);

        const report = reportRef.current;
        if (report && imagesLoaded) {
            html2canvas(report, {
                useCORS: true,
                allowTaint: false,
                logging: true,
                scale: 2,
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");

                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;

                let position = 0;

                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save("solar_report.pdf");
            });
        } else {
            toast.error("Please wait for images to load before generating the PDF.");
        }
    } catch (error) {
        toast.error("An error occurred while generating the PDF. Please try again.");
    }finally {
      setIsGeneratingPdf(false);
    }
};
useEffect(() => {
  const email = localStorage.getItem('email');
  if (email) {
    fetchRemainingDownloads(email);
  }
}, []);

  const convertPitchToFraction = (pitchDegrees: any) => {
    const pitchRadians = pitchDegrees * (Math.PI / 180);
    const rise = Math.tan(pitchRadians) * 12;
    const riseRounded = Math.round(rise);
    return `${riseRounded}/12`;
  };

  const convertSquareMetersToSquareFeet = (areaMeters2: number) =>
    areaMeters2 * 10.7639;

  const totalRoofArea = solarData?.solarPotential.roofSegmentStats.reduce(
    (sum: number, segment: any) => sum + segment.stats.areaMeters2,
    0
  );
  const totalRoofAreaInSqFt = convertSquareMetersToSquareFeet(totalRoofArea);

  const groupByPitch = () => {
    const pitchMap: {
      [key: string]: { totalArea: number; segments: any[]; percentage: number };
    } = {};

    solarData?.solarPotential.roofSegmentStats?.forEach((segment: any) => {
      const pitchFraction = convertPitchToFraction(segment.pitchDegrees);
      const areaInSqFt = convertSquareMetersToSquareFeet(
        segment.stats.areaMeters2
      );
      if (!pitchMap[pitchFraction]) {
        pitchMap[pitchFraction] = {
          totalArea: 0,
          segments: [],
          percentage: 0,
        };
      }
      pitchMap[pitchFraction].totalArea += areaInSqFt;
      pitchMap[pitchFraction].segments.push(segment);
    });
    let overallTotalArea = Object.values(pitchMap).reduce(
      (sum, { totalArea }) => sum + totalArea,
      0
    );

    Object.keys(pitchMap).forEach((pitchFraction) => {
      const pitchData = pitchMap[pitchFraction];
      pitchData.percentage = (pitchData.totalArea / overallTotalArea) * 100;
    });

    return pitchMap;
  };

  const pitchGroups = groupByPitch();

  const toFraction = (decimal: any) => {
    const tolerance = 1.0e-6;
    let numerator = 1;
    let denominator = 1;
    let fraction = decimal;

    while (Math.abs(fraction - decimal) > tolerance) {
      if (fraction < decimal) {
        numerator++;
      } else {
        denominator++;
        numerator = Math.round(decimal * denominator);
      }
      fraction = numerator / denominator;
    }

    return `${numerator}/${denominator}`;
  };



  useEffect(() => {
    if (solarData?.solarPotential?.roofSegmentStats) {
      const pitches_areas = solarData.solarPotential.roofSegmentStats.map(
        (el: any) => ({
          pitch: Math.tan((el.pitchDegrees * Math.PI) / 180),
          area: convertSquareMetersToSquareFeet(el.stats?.areaMeters2),
        })
      );

      const total_area = pitches_areas.reduce(
        (sum: number, facet: any) => sum + facet.area,
        0
      );
      const weighted_pitch_sum = pitches_areas.reduce(
        (sum: number, facet: any) => sum + facet.pitch * facet.area,
        0
      );
      if (total_area > 0) {
        const calculatedPitch = weighted_pitch_sum / total_area;
      } 
    }
  }, [solarData]);
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mb={5}>
  {subscriptionStatus.active ? (
    
<Button
  variant="contained"
  color="primary"
  onClick={SubscribeGeneratePdf}
  sx={{ mt: 2, mb: 2 }}
  disabled={isGeneratingPdf || isLoading}
>
  {isGeneratingPdf ? (
    <CircularProgress size={24} color="inherit" />
  ) : (
    "Generate Report"
  )}
</Button>

  ) : (
    <>
      {isLoading ? (
        <CircularProgress size={24} sx={{ mb: 2, mt: 2 }} />
      ) : (
        <Typography variant="body2" sx={{ mb: 3, mt: 2, color: "red" }}>
          Total Free Downloads: 10 | Remaining Free Downloads:{" "}
          {remainingDownloads !== null ? remainingDownloads : "Loading..."}
        </Typography>
      )}
      
      <Box mb={2} display="flex" flexDirection="column" alignItems="center">
        {remainingDownloads === 0 ? (
          <Box mb={2} display="flex" flexDirection="column" alignItems="center">
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <Typography variant="body2" mb={2}>
                  Please subscribe to generate more PDFs,
                </Typography>

                <Button
                  variant="contained"
                  color="secondary"
                  disabled={isLoading}
                  onClick={handlePayment}
                  startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                >
                  {isLoading ? "Processing..." : "Make the payment"}
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Button
            onClick={generatePdf}
            variant="contained"
            color="primary"
            disabled={isLoading || isGeneratingPdf || !imagesLoaded}
            startIcon={
              (isLoading || isGeneratingPdf) && <CircularProgress size={20} color="inherit" />
            }
          >
            {isLoading
              ? "Loading..."
              : isGeneratingPdf
              ? "Downloading..."
              : "Download Report as PDF"}
          </Button>
        )}
      </Box>
      </>
      )}
      <Box 
       display="flex"
       flexDirection="column"
       gap={2}
       alignItems="center"
       mb={5}
      >
<TextField
  select
  label="Select Roof Type"
  value={selectedRoofType}
  onChange={(e) => setSelectedRoofType(e.target.value)}
  margin="normal"
  sx={{ width: 500 }}
  fullWidth
  variant="outlined"
>
  <MenuItem value="" disabled>Select Roof Type</MenuItem>
  {roofTypes.map((roof) => (
    <MenuItem key={roof.id} value={roof.id}>
      {/* {roof.name} */}
    </MenuItem>
  ))}
</TextField>

<TextField
        label="Waste Tiers"
        value={`${currentWasteTier ?? 0}%`}
        margin="normal"
        sx={{ width: 500 }}
        fullWidth
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
      />
<FormControl sx={{ width: 500 }} margin="normal">
        <InputLabel>Select Material</InputLabel>
        <Select
          multiple
          value={selectedMaterials}
          onChange={handleMaterialChange}
          renderValue={() => selectedMaterialNames}
          label="Select Material"

                  >
          {materials && materials.length > 0 ? (
            materials.map((material) => (
              <MenuItem key={material.id} value={material.id}>
                <Checkbox checked={selectedMaterials.indexOf(material.id) > -1} />
                <ListItemText primary={material.name} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No materials available</MenuItem>
          )}
        </Select>
      </FormControl>
<Button variant="contained" color="primary" sx={{ width: 500 }} onClick={handleSubmit}>
        Submit
      </Button>
</Box>
<Box
        ref={reportRef}
        id="solar-report"
        alignContent={"center"}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        px={4}
      >
      {data && (
        <TableContainer component={Paper} elevation={3} style={{
          marginBottom: '30px', 
          width: '700px', 
          marginLeft: 'auto', 
          marginRight: 'auto'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Roof Type</strong></TableCell>
                <TableCell><strong>Material</strong></TableCell>
                <TableCell><strong>Cost</strong></TableCell>
                {/* <TableCell><strong>Additional Fee</strong></TableCell> */}
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Waste Tier</strong></TableCell>
                <TableCell><strong>Calculate WasteTier</strong></TableCell>


              </TableRow>
            </TableHead>
            <TableBody>
              {getMaterialWithFee(data.roofTypeName, data.materials|| []).map((material, index) => (
                <TableRow key={index}>
                  <TableCell>{data.roofTypeName}</TableCell>
                  {/* <TableCell>{material.materialName}</TableCell> */}
                  <TableCell>${material.materialCost.toFixed(2)}</TableCell>

                  {/* <TableCell>{material.additionalFee ? `$${material.additionalFee.toFixed(2)}` : "N/A"}</TableCell> */}
                  <TableCell>
                    {material.materialCost + (material.additionalFee || 0) > 0
                      ? `$${(material.materialCost + (material.additionalFee || 0)).toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{`${currentWasteTier}%`}</TableCell>
                  <TableCell>
                  {Number(material.materialCost || 0) + Number(material.additionalFee || 0) > 0
  ? `$${(
      (Number(material.materialCost || 0) + Number(material.additionalFee || 0)) *
      (1 - Number(currentWasteTier || 0) / 100)
    ).toFixed(2)}`
  : "-"}


</TableCell>          
      </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
        <Typography textAlign={"center"} fontWeight={"bold"}>
          {state?.address}
        </Typography>

        {state?.lat && state?.lng && (
          <Box
            gap={4}
            display="flex"
            flexDirection="row"
            justifyContent="center"
            mt={4}
            className="max-md:!flex-col"
          >
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${state?.lat},${state?.lng}&zoom=20&size=300x300&scale=2&maptype=satellite&key=${process?.env?.NEXT_PUBLIC_API_KEY}`}
              onLoad={checkImagesLoaded}
              onError={checkImagesLoaded}
              alt="Static Map"
              crossOrigin="anonymous"
            />
            <img
              src={`https://maps.googleapis.com/maps/api/streetview?size=640x640&location=${state?.lat},${state?.lng}&fov=80&key=${process?.env?.NEXT_PUBLIC_API_KEY}`}
              onLoad={checkImagesLoaded}
              onError={checkImagesLoaded}
              alt="Street View"
              crossOrigin="anonymous"
            />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {solarData?.solarPotential.roofSegmentStats?.length > 0 && (
            <Box
              sx={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                mt: 2,
              }}
            >
              <Typography variant="body1">
                Roof Facets:{" "}
                {solarData?.solarPotential.roofSegmentStats?.length}
              </Typography>
              <Typography variant="body1">
                Total Roof Area: {totalRoofAreaInSqFt.toFixed(2)} ft²
              </Typography>
              {/* <Typography variant="body1">
                Ground Area: {groundArea.toFixed(2)} ft²
              </Typography> */}
            </Box>
          )}
        </Box>
        <Typography textAlign={"center"} fontWeight={"bold"} my={2}>
          Roof Pitch
        </Typography>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={"2px"}
          justifyContent="center"
          m={2}
        >
          {Object.entries(pitchGroups).map(
            ([pitch, { totalArea, segments, percentage }], index: number) => (
              <Box
                key={index}
                p={1}
                boxSizing="border-box"
                sx={{
                  border: "1px solid #ccc",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                  alignContent: "center",
                }}
              >
                <Typography>Pitch: {pitch}</Typography>
                <Typography>
                  Total Area: {totalArea.toFixed(2)} sq ft
                </Typography>
                <Typography>{percentage.toFixed(2)}%</Typography>
              </Box>
            )
          )}
        </Box>

        <Typography textAlign={"center"} fontWeight={"bold"} my={2}>
          Building Details
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={"2px"} justifyContent="center">
          {solarData?.solarPotential.roofSegmentStats?.map(
            (el: any, index: number) => (
              <Box
                key={index}
                p={1}
                boxSizing="border-box"
                sx={{
                  border: "1px solid #ccc",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                  py: 1,
                }}
              >
                <Typography>Roof facet {index + 1}</Typography>
                <Typography>
                  Area{" "}
                  {convertSquareMetersToSquareFeet(
                    el?.stats?.areaMeters2
                  ).toFixed(2)}{" "}
                  sq ft
                </Typography>
                <Typography>
                  Pitch {convertPitchToFraction(el?.pitchDegrees)}
                </Typography>
              </Box>
            )
          )}
        </Box>
        
      </Box>
      
    </Box>
  );
};

export default SolarReport;