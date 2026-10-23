// src/features/auth/AuthFooterLinks.tsx
import { SketchButton } from "@/shared/ui";
import { createStyles } from "@/shared/theme";
import { ComponentProps } from "react";
import { View } from "react-native";

interface AuthFooterLinksProps {
  links: Pick<ComponentProps<typeof SketchButton>, "title" | "onPress">[];
}

export const AuthFooterLinks = ({ links }: AuthFooterLinksProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {links.map((link) => (
        <SketchButton key={link.title} variant="link" {...link} />
      ))}
    </View>
  );
};

const useStyles = createStyles((t) => ({
  container: { marginTop: t.spacing.xl, gap: t.spacing.lg, alignItems: "center" },
}));
