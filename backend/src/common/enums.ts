export enum TipoInformePractica {
  PARCIAL = 'parcial',
  FINAL = 'final',
}

export enum EstadoConvenio {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado',
}

export enum EstadoOferta {
  BORRADOR = 'borrador',
  PUBLICADA = 'publicada',
  CERRADA = 'cerrada',
  CANCELADA = 'cancelada',
}

export enum EstadoPostulacion {
  POSTULADO = 'postulado',
  PRESELECCIONADO = 'preseleccionado',
  RECHAZADO = 'rechazado',
  APROBADO = 'aprobado',
}

export enum EstadoPractica {
  PENDIENTE_ASIGNACION = 'pendiente_asignacion',
  ACTIVA = 'activa',
  EN_EVALUACION = 'en_evaluacion',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

export enum EstadoInforme {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

export enum EstadoProyectoTesis {
  EN_REGISTRO = 'en_registro',
  PROPUESTO = 'propuesto',
  APROBADO = 'aprobado',
  EN_DESARROLLO = 'en_desarrollo',
  EN_REVISION = 'en_revision',
  CULMINADO = 'culminado',
  DESAPROBADO = 'desaprobado',
}

export enum TipoAsignacionTesis {
  ASESOR = 'asesor',
  JURADO = 'jurado',
}

export enum RolJurado {
  PRESIDENTE = 'presidente',
  SECRETARIO = 'secretario',
  VOCAL = 'vocal',
}

export enum EstadoEntregaTesis {
  ENTREGADO = 'entregado',
  REVISANDO = 'revisando',
  APROBADO = 'aprobado',
  OBSERVADO = 'observado',
}

export enum ResultadoSustentacion {
  APROBADO = 'aprobado',
  DESAPROBADO = 'desaprobado',
}

export enum TipoNotificacion {
  INFO = 'info',
  EXITO = 'exito',
  ADVERTENCIA = 'advertencia',
  ERROR = 'error',
}

export enum EntidadAdjunto {
  PRACTICA = 'practica',
  INFORME = 'informe',
  ENTREGA_TESIS = 'entrega_tesis',
  ACTA = 'acta',
  CONVENIO = 'convenio',
}