import { Image } from "expo-image";
import { StyleSheet, View, useColorScheme } from "react-native";

import circle from "@/assets/project-icons/circle.svg";
import star from "@/assets/project-icons/star.svg";
import sun from "@/assets/project-icons/sun.svg";
import earth from "@/assets/project-icons/earth.svg";
import sprout from "@/assets/project-icons/sprout.svg";
import leaf from "@/assets/project-icons/leaf.svg";
import backpack from "@/assets/project-icons/backpack.svg";
import footprints from "@/assets/project-icons/footprints.svg";
import dumbbell from "@/assets/project-icons/dumbbell.svg";
import heart from "@/assets/project-icons/heart.svg";
import pill from "@/assets/project-icons/pill.svg";
import syringe from "@/assets/project-icons/syringe.svg";
import testTubeDiagonal from "@/assets/project-icons/test-tube-diagonal.svg";
import book from "@/assets/project-icons/book.svg";
import libraryBig from "@/assets/project-icons/library-big.svg";
import notepadText from "@/assets/project-icons/notepad-text.svg";
import brain from "@/assets/project-icons/brain.svg";
import graduationCap from "@/assets/project-icons/graduation-cap.svg";
import languages from "@/assets/project-icons/languages.svg";
import megaphone from "@/assets/project-icons/megaphone.svg";
import presentation from "@/assets/project-icons/presentation.svg";
import micVocal from "@/assets/project-icons/mic-vocal.svg";
import music from "@/assets/project-icons/music.svg";
import headphones from "@/assets/project-icons/headphones.svg";
import camera from "@/assets/project-icons/camera.svg";
import clapperboard from "@/assets/project-icons/clapperboard.svg";
import gamepad2 from "@/assets/project-icons/gamepad-2.svg";
import chessKnight from "@/assets/project-icons/chess-knight.svg";
import puzzle from "@/assets/project-icons/puzzle.svg";
import palette from "@/assets/project-icons/palette.svg";
import paintbrush from "@/assets/project-icons/paintbrush.svg";
import shovel from "@/assets/project-icons/shovel.svg";
import wrench from "@/assets/project-icons/wrench.svg";
import car from "@/assets/project-icons/car.svg";
import motorbike from "@/assets/project-icons/motorbike.svg";
import bike from "@/assets/project-icons/bike.svg";
import truck from "@/assets/project-icons/truck.svg";
import plane from "@/assets/project-icons/plane.svg";
import sailboat from "@/assets/project-icons/sailboat.svg";
import fish from "@/assets/project-icons/fish.svg";
import apple from "@/assets/project-icons/apple.svg";
import hamburger from "@/assets/project-icons/hamburger.svg";
import beer from "@/assets/project-icons/beer.svg";
import coffee from "@/assets/project-icons/coffee.svg";
import chefHat from "@/assets/project-icons/chef-hat.svg";
import award from "@/assets/project-icons/award.svg";
import trophy from "@/assets/project-icons/trophy.svg";
import badgeDollarSign from "@/assets/project-icons/badge-dollar-sign.svg";
import shoppingCart from "@/assets/project-icons/shopping-cart.svg";
import briefcaseBusiness from "@/assets/project-icons/briefcase-business.svg";
import chartNoAxesCombined from "@/assets/project-icons/chart-no-axes-combined.svg";
import laptopMinimal from "@/assets/project-icons/laptop-minimal.svg";
import codeXml from "@/assets/project-icons/code-xml.svg";
import scale from "@/assets/project-icons/scale.svg";
import lightbulb from "@/assets/project-icons/lightbulb.svg";
import balloon from "@/assets/project-icons/balloon.svg";
import baby from "@/assets/project-icons/baby.svg";
import cat from "@/assets/project-icons/cat.svg";
import dog from "@/assets/project-icons/dog.svg";
import pawPrint from "@/assets/project-icons/paw-print.svg";

interface ProjectIconProps {
  name: string;
  size?: number;
  color?: string;
}

const ICON_ASSETS: Record<string, any> = {
  circle,
  star,
  sun,
  earth,
  sprout,
  leaf,
  backpack,
  footprints,
  dumbbell,
  heart,
  pill,
  syringe,
  "test-tube-diagonal": testTubeDiagonal,
  book,
  "library-big": libraryBig,
  "notepad-text": notepadText,
  brain,
  "graduation-cap": graduationCap,
  languages,
  megaphone,
  presentation,
  "mic-vocal": micVocal,
  music,
  headphones,
  camera,
  clapperboard,
  "gamepad-2": gamepad2,
  "chess-knight": chessKnight,
  puzzle,
  palette,
  paintbrush,
  shovel,
  wrench,
  car,
  motorbike,
  bike,
  truck,
  plane,
  sailboat,
  fish,
  apple,
  hamburger,
  beer,
  coffee,
  "chef-hat": chefHat,
  award,
  trophy,
  "badge-dollar-sign": badgeDollarSign,
  "shopping-cart": shoppingCart,
  "briefcase-business": briefcaseBusiness,
  "chart-no-axes-combined": chartNoAxesCombined,
  "laptop-minimal": laptopMinimal,
  "code-xml": codeXml,
  scale,
  lightbulb,
  balloon,
  baby,
  cat,
  dog,
  "paw-print": pawPrint,
};

export function ProjectIcon({ name, size = 24, color }: ProjectIconProps) {
  const iconKey = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const source = ICON_ASSETS[iconKey] || circle;
  const colorScheme = useColorScheme();
  const iconColor = color || (colorScheme === "dark" ? "#fff" : "#fff");
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={[styles.image, { width: size, height: size }]}
        contentFit="contain"
        tintColor={iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});