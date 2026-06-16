export interface Telefono {
    codigo_area: number;
    nro_telefono: number;
    tipo: string;
}

export interface Cliente {
    nro_cliente: number;
    nombre: string;
    apellido: string;
    direccion: string;
    activo: number;
    telefonos: Telefono[];
}
