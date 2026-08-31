import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { site } from "@content/site";
import { formatIntakeAddress, type IntakeFormValues } from "@/lib/validations/intake";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1f2933",
  },
  header: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subheader: {
    fontSize: 10,
    color: "#52606d",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  row: {
    marginBottom: 4,
  },
  label: {
    fontFamily: "Helvetica-Bold",
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.row}>
      <Text style={styles.label}>{label}: </Text>
      {value || "—"}
    </Text>
  );
}

export function IntakePdfDocument({
  values,
  consentedAt,
}: {
  values: IntakeFormValues;
  consentedAt: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{site.name}</Text>
        <Text style={styles.subheader}>Dog intake form · {new Date(consentedAt).toUTCString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner</Text>
          <Row label="Name" value={values.ownerName} />
          <Row label="Email" value={values.ownerEmail} />
          <Row label="Phone" value={values.ownerPhone ?? "Not provided"} />
          <Row label="Session type" value={values.meetingType === "virtual" ? "Virtual" : "In person"} />
          {values.meetingType === "in_person" ? (
            <Row label="Address" value={formatIntakeAddress(values)} />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dog</Text>
          <Row label="Name" value={values.dogName} />
          <Row label="Breed" value={values.breed} />
          <Row label="Age" value={`${values.ageYears} years`} />
          <Row label="Sex" value={values.sex} />
          <Row label="Neutered" value={values.neutered ? "Yes" : "No"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behaviour and goals</Text>
          <Row label="Recall" value={values.recall} />
          <Row label="Lead walking" value={values.leadWalking} />
          <Row label="Fear triggers" value={values.fearTriggers} />
          <Row label="Aggression notes" value={values.aggressionNotes} />
          <Row label="Previous training" value={values.previousTraining} />
          <Row label="Goals" value={values.goals} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent</Text>
          <Row label="Data storage agreed" value="Yes" />
          <Row label="Consented at" value={consentedAt} />
        </View>
      </Page>
    </Document>
  );
}

export async function generateIntakePdf(values: IntakeFormValues, consentedAt: string) {
  return renderToBuffer(<IntakePdfDocument values={values} consentedAt={consentedAt} />);
}
