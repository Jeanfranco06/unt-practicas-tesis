import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 5 },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, padding: 5 },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
});

export function InternshipReportPDF({ data }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Prácticas Preprofesionales</Text>
        <Text style={styles.text}>Fecha: {new Date().toLocaleDateString()}</Text>
        <Text>Total prácticas: {data.total}</Text>
        <Text>Activas: {data.active}</Text>
        <Text>Finalizadas: {data.completed}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableCol}><Text>ID</Text></View>
            <View style={styles.tableCol}><Text>Estudiante</Text></View>
            <View style={styles.tableCol}><Text>Empresa</Text></View>
            <View style={styles.tableCol}><Text>Estado</Text></View>
          </View>
          {data.details.map((item: any) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={styles.tableCol}><Text>{item.id}</Text></View>
              <View style={styles.tableCol}><Text>{item.estudiante}</Text></View>
              <View style={styles.tableCol}><Text>{item.empresa}</Text></View>
              <View style={styles.tableCol}><Text>{item.estado}</Text></View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}