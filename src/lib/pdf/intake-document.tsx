import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Image, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { site } from "@content/site";
import { formatIntakeAddress, type IntakeFormValues } from "@/lib/validations/intake";

const colors = {
  green: "#1e3d32",
  cream: "#f7f1e4",
  gold: "#c4a35a",
  ink: "#243028",
  muted: "#5c6b66",
  line: "#e4d9c5",
  paper: "#fffdf8",
  box: "#f3eee3",
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.ink,
    backgroundColor: colors.paper,
  },
  header: {
    backgroundColor: colors.green,
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  brand: {
    color: colors.cream,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
  },
  headerMeta: {
    color: colors.gold,
    fontSize: 9,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  goldBar: {
    height: 4,
    backgroundColor: colors.gold,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 22,
    paddingBottom: 28,
  },
  titleRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  subtitle: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 4,
  },
  columns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  column: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 12,
    backgroundColor: colors.cream,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.green,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 8,
  },
  label: {
    width: 92,
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingTop: 1,
  },
  value: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  notes: {
    marginBottom: 6,
  },
  notesLabel: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  notesValue: {
    fontSize: 10,
    lineHeight: 1.45,
    backgroundColor: colors.box,
    padding: 8,
    borderRadius: 4,
  },
  skills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  skill: {
    flex: 1,
    backgroundColor: colors.box,
    borderRadius: 4,
    padding: 8,
  },
  skillLabel: {
    fontSize: 8,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  skillValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.green,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.muted,
    fontSize: 8,
  },
});

function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";
}

export function formatConsentedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

function Note({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.notes}>
      <Text style={styles.notesLabel}>{label}</Text>
      <Text style={styles.notesValue}>{value?.trim() ? value : "None noted"}</Text>
    </View>
  );
}

function brandLogoSrc() {
  const candidates = [
    join(process.cwd(), "src/lib/pdf/assets/logo.jpg"),
    join(process.cwd(), "public/brand/logo.jpg"),
  ];
  for (const file of candidates) {
    try {
      return `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;
    } catch {
      // Try the next bundled path.
    }
  }
  return null;
}

export function IntakePdfDocument({
  values,
  consentedAt,
  logoSrc,
}: {
  values: IntakeFormValues;
  consentedAt: string;
  logoSrc?: string | null;
}) {
  const consentedLabel = formatConsentedAt(consentedAt);
  const dogTitle = values.dogName ? `${values.dogName} intake` : "Dog intake form";

  return (
    <Document title={`${dogTitle} · ${site.name}`} author={site.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
          <View>
            <Text style={styles.brand}>{site.name}</Text>
            <Text style={styles.headerMeta}>Confidential dog intake</Text>
          </View>
        </View>
        <View style={styles.goldBar} />

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{values.dogName}</Text>
            <Text style={styles.subtitle}>
              {values.breed} · {consentedLabel}
            </Text>
          </View>

          <View style={styles.columns}>
            <View style={[styles.section, styles.column]}>
              <Text style={styles.sectionTitle}>Owner</Text>
              <Field label="Name" value={values.ownerName} />
              <Field label="Email" value={values.ownerEmail} />
              <Field label="Phone" value={values.ownerPhone || "Not provided"} />
              <Field label="Session" value={values.meetingType === "virtual" ? "Virtual" : "In person"} />
              {values.meetingType === "in_person" ? (
                <Field label="Address" value={formatIntakeAddress(values)} />
              ) : null}
            </View>
            <View style={[styles.section, styles.column]}>
              <Text style={styles.sectionTitle}>Dog</Text>
              <Field label="Name" value={values.dogName} />
              <Field label="Breed" value={values.breed} />
              <Field label="Age" value={`${values.ageYears} years`} />
              <Field label="Sex" value={titleCase(values.sex)} />
              <Field label="Neutered" value={values.neutered ? "Yes" : "No"} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Behaviour and goals</Text>
            <View style={styles.skills}>
              <View style={styles.skill}>
                <Text style={styles.skillLabel}>Recall</Text>
                <Text style={styles.skillValue}>{titleCase(values.recall)}</Text>
              </View>
              <View style={styles.skill}>
                <Text style={styles.skillLabel}>Lead walking</Text>
                <Text style={styles.skillValue}>{titleCase(values.leadWalking)}</Text>
              </View>
            </View>
            <Note label="Fear triggers" value={values.fearTriggers} />
            <Note label="Aggression notes" value={values.aggressionNotes} />
            <Note label="Previous training" value={values.previousTraining} />
            <Note label="Goals" value={values.goals} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consent</Text>
            <Field label="Data storage" value="Agreed" />
            <Field label="Recorded" value={consentedLabel} />
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{site.name} · for training use only</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function generateIntakePdf(values: IntakeFormValues, consentedAt: string) {
  return renderToBuffer(<IntakePdfDocument values={values} consentedAt={consentedAt} logoSrc={brandLogoSrc()} />);
}
