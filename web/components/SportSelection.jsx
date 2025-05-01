import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CyclistOutline from "../assets/cyclist-outline.png";
import RunnerOutline from "../assets/runner-outline.png";
import WeightTrainingOutline from "../assets/weight-training-outline.png";
import { useGlobalAction } from "@gadgetinc/react";
import { api } from "../api";

export const SportSelection = ({ userMetadata, setUserMetadata }) => {
  const sports = {
    weight_training: WeightTrainingOutline,
    cycling: CyclistOutline,
    running: RunnerOutline,
  };

  const formatSportName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const experienceLevels = [
    "No Interest",
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const defaultExperienceLevel = {};
  Object.keys(sports).forEach((sport) => {
    defaultExperienceLevel[sport] = 0;
  });

  const [experienceLevelMap, setExperienceLevelMap] = useState(
    defaultExperienceLevel
  );

  const navigate = useNavigate();

  const [{ fetching: isGenerating, error }, runGenerateWorkout] =
    useGlobalAction(api.generateWorkout);

  const handleButtonClick = async () => {
    const convertedExperienceLevelMap = {};
    for (let sport in experienceLevelMap) {
      convertedExperienceLevelMap[sport] =
        experienceLevels[experienceLevelMap[sport]];
    }

    const updatedMetadata = {
      ...userMetadata, // Use existing userMetadata instead of prev
      experienceLevelMap: convertedExperienceLevelMap,
    };

    setUserMetadata(updatedMetadata);

    try {
      await runGenerateWorkout({ userMetadata: updatedMetadata });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to generate workout:", error);
    }
  };

  const SportSelection = ({ sportName, image, onClick }) => {
    const [sliderValue, setSliderValue] = useState(
      experienceLevelMap[sportName]
    );

    return (
      <Box
        borderWidth="1px"
        borderRadius="md"
        onClick={onClick}
        minWidth="900px"
      >
        <HStack p={2} justify="space-between" width="100%" pr="65px">
          <Flex align="center">
            <Image
              src={image}
              alt={sportName}
              height="70px"
              width="70px"
              objectFit="contain"
              mb="4"
            />
            <Text fontSize="2xl" color="gray.500" ml="35px">
              {formatSportName(sportName)}
            </Text>
          </Flex>
          <Slider
            value={sliderValue}
            min={0}
            max={experienceLevels.length - 1}
            step={1}
            maxWidth="400px"
            onChange={(val) => setSliderValue(val)}
            onChangeEnd={(val) =>
              setExperienceLevelMap((prevState) => ({
                ...prevState,
                [sportName]: val,
              }))
            }
          >
            <SliderMark value={0} mt="2.5" ml="-2.5" fontSize="sm">
              {experienceLevels[0]}
            </SliderMark>
            <SliderMark
              value={experienceLevels.length - 1}
              mt="2"
              ml="-2.5"
              fontSize="sm"
            >
              {experienceLevels.at(-1)}
            </SliderMark>
            <SliderTrack bg="gray.100">
              <SliderFilledTrack bg="gray.500" />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </HStack>
      </Box>
    );
  };

  useEffect(() => {
    console.log(experienceLevelMap);
  }, [experienceLevelMap]);

  return (
    <Box position="relative" minH="100vh">
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        gap={4}
        p="4"
      >
        {Object.keys(sports).map((sport, i) => {
          return (
            <SportSelection key={i} sportName={sport} image={sports[sport]} />
          );
        })}
        <Box minWidth="900px" textAlign="right">
          <Button
            onClick={handleButtonClick}
            isLoading={isGenerating}
            loadingText="Generating..."
          >
            Get Started
          </Button>
          <Text color="gray.500" fontSize="sm">{isGenerating ? "Takes about a minute ⏱️" : ""}</Text>
          {error && (
            <Text color="red.500" mt={2}>
              Error generating workout: {error.message}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
