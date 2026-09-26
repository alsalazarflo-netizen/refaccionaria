export type Rol = 'cliente' | 'admin' | string;

export type Usuario = {
	id: string;
	nombre: string;
	apellido: string;
	correo: string;
	telefono: string | null;
	rol: Rol;
	created_at: string;
};

export type Auto = {
	id: string;
	usuario_id: string;
	marca: string;
	modelo: string;
	año: number | null;
	placa: string | null;
	created_at: string;
};

export type Pieza = {
	id: string;
	nombre: string;
	descripcion: string | null;
	marca: string | null;
	categoria: string | null;
	precio: number;
	stock: number;
	codigo: string;
	created_at: string;
	updated_at: string;
};
