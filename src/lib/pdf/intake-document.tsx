import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Image as PdfImage, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { site } from "@content/site";
import {
  dogJobLabels,
  formatDogAge,
  formatIntakeAddress,
  legacyGroundLabels,
  shotSteadyLabels,
  startedLabels,
  steadyLabels,
  type IntakeFormValues,
} from "@/lib/validations/intake";

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
    paddingBottom: 40,
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
    marginBottom: 4,
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
    width: 118,
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
  pair: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.muted,
    fontSize: 8,
  },
});

function choiceLabel(labels: Record<string, string>, value: string) {
  if (!value) {
    return "Not set";
  }
  return labels[value] ?? value;
}

function titleCase(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
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
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

function Note({ label, value }: { label: string; value: string }) {
  const text = value?.trim() ?? "";
  if (!text) {
    return null;
  }
  return (
    <View style={styles.notes} wrap={false}>
      <Text style={styles.notesLabel}>{label}</Text>
      <Text style={styles.notesValue}>{text}</Text>
    </View>
  );
}

function jpegDataUrl(filePath: string) {
  return `data:image/jpeg;base64,${readFileSync(filePath).toString("base64")}`;
}

function brandLogoSrc() {
  try {
    return jpegDataUrl(join(process.cwd(), "src/lib/pdf/assets", "logo.jpg"));
  } catch {
    try {
      return jpegDataUrl(join(process.cwd(), "public/brand", "logo.jpg"));
    } catch {
      return null;
    }
  }
}

export function IntakePdfDocument({
  values,
  consentedAt,
  trainerNotes = "",
  logoSrc,
}: {
  values: IntakeFormValues;
  consentedAt: string;
  trainerNotes?: string;
  logoSrc?: string | null;
}) {
  const consentedLabel = formatConsentedAt(consentedAt);
  const dogTitle = values.dogName ? `${values.dogName} intake` : "Dog intake form";

  return (
    <Document title={`${dogTitle} · ${site.name}`} author={site.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoSrc ? <PdfImage src={logoSrc} style={styles.logo} /> : null}
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

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.columns}>
              <View style={styles.pair}>
                <Field label="Name" value={values.ownerName} />
                <Field label="Phone" value={values.ownerPhone || "Not provided"} />
              </View>
            <View style={styles.pair}>
              <Field label="Session" value={values.meetingType === "virtual" ? "Virtual" : "In person"} />
            </View>
          </View>
          <Field label="Email" value={values.ownerEmail} />
          {values.meetingType === "in_person" ? (
            <Field label="Address" value={formatIntakeAddress(values)} />
          ) : null}
        </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Dog</Text>
            <View style={styles.columns}>
              <View style={styles.pair}>
                <Field label="Name" value={values.dogName} />
                <Field label="Breed" value={values.breed} />
                <Field label="Age" value={formatDogAge(values)} />
              </View>
              <View style={styles.pair}>
                <Field label="Job" value={choiceLabel(dogJobLabels, values.dogJob)} />
                <Field label="Sex" value={titleCase(values.sex)} />
                <Field label="Neutered" value={values.neutered ? "Yes" : "No"} />
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>The job</Text>
            <Field label="Dummy work" value={choiceLabel(startedLabels, values.dummyWork)} />
            <Field label="Whistle" value={choiceLabel(startedLabels, values.whistle)} />
            <Field label="Birds" value={choiceLabel(steadyLabels, values.steadyBirds)} />
            <Field label="Other dogs" value={choiceLabel(steadyLabels, values.steadyDogs)} />
            <Field label="Shot" value={choiceLabel(shotSteadyLabels, values.steadyShot)} />
            <Field label="Place outdoors" value={choiceLabel(legacyGroundLabels, values.hasGround)} />
            <Note label="Notes about the place" value={values.groundNotes} />
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Behaviour and goals</Text>
            <Note label="Fear triggers" value={values.fearTriggers} />
            <Note label="Aggression notes" value={values.aggressionNotes} />
            <Note label="Previous training" value={values.previousTraining} />
            <Note label="Additional notes" value={values.extraNotes} />
            <Note label="Goals" value={values.goals} />
            {!values.fearTriggers.trim() &&
            !values.aggressionNotes.trim() &&
            !values.previousTraining.trim() &&
            !values.extraNotes.trim() &&
            !values.goals.trim() ? (
              <Field label="Notes" value="None noted" />
            ) : null}
          </View>

          {trainerNotes.trim() ? (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Trainer notes</Text>
              <Note label="After the appointment" value={trainerNotes} />
            </View>
          ) : null}

          <View style={styles.section} wrap={false}>
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

export async function generateIntakePdf(
  values: IntakeFormValues,
  consentedAt: string,
  trainerNotes = "",
) {
  return renderToBuffer(
    <IntakePdfDocument
      values={values}
      consentedAt={consentedAt}
      trainerNotes={trainerNotes}
      logoSrc={brandLogoSrc()}
    />,
  );
}
