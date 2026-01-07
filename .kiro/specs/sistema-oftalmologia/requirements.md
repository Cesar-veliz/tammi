# Documento de Requerimientos - Sistema de Gestión Oftalmológica

## Introducción

Sistema de gestión de pacientes diseñado específicamente para consultas oftalmológicas, que permite el registro, almacenamiento y búsqueda de información de pacientes, incluyendo datos personales, antecedentes médicos y exámenes oftalmológicos completos. El sistema incluye funcionalidades de autenticación con roles diferenciados y capacidades de impresión de recetas médicas.

## Glosario

- **Sistema_Oftalmologia**: El sistema de gestión de pacientes oftalmológicos
- **Admin**: Usuario con rol de administrador (doctora oftalmóloga)
- **Usuario**: Personal de la consulta con permisos limitados
- **Paciente**: Persona registrada en el sistema para atención oftalmológica
- **Ficha_Clinica**: Registro médico completo del paciente
- **OD**: Ojo Derecho
- **OI**: Ojo Izquierdo
- **RUT**: Rol Único Tributario (identificador único chileno)
- **HTA**: Hipertensión Arterial
- **DM**: Diabetes Mellitus
- **Receta**: Documento médico imprimible con prescripción oftalmológica

## Requerimientos

### Requerimiento 1

**Historia de Usuario:** Como doctora oftalmóloga, quiero autenticarme en el sistema con diferentes niveles de acceso, para que pueda controlar quién puede ver y modificar la información de mis pacientes.

#### Criterios de Aceptación

1. WHEN un usuario ingresa credenciales válidas de admin, THE Sistema_Oftalmologia SHALL otorgar acceso completo a todas las funcionalidades
2. WHEN un usuario ingresa credenciales válidas de usuario, THE Sistema_Oftalmologia SHALL otorgar acceso limitado según permisos asignados
3. WHEN un usuario ingresa credenciales inválidas, THE Sistema_Oftalmologia SHALL denegar el acceso y mostrar mensaje de error
4. WHEN una sesión expira, THE Sistema_Oftalmologia SHALL requerir nueva autenticación
5. THE Sistema_Oftalmologia SHALL encriptar todas las contraseñas almacenadas

### Requerimiento 2

**Historia de Usuario:** Como personal médico, quiero registrar nuevos pacientes con sus datos personales completos, para que pueda mantener un registro organizado y accesible.

#### Criterios de Aceptación

1. WHEN se registra un nuevo paciente, THE Sistema_Oftalmologia SHALL almacenar RUT, nombres, apellidos, edad, fecha de nacimiento, teléfono y correo electrónico
2. WHEN se ingresa un RUT, THE Sistema_Oftalmologia SHALL validar el formato y unicidad del RUT
3. WHEN se ingresan datos obligatorios incompletos, THE Sistema_Oftalmologia SHALL prevenir el registro y mostrar campos faltantes
4. WHEN se registra exitosamente un paciente, THE Sistema_Oftalmologia SHALL asignar un identificador único y confirmar el registro
5. THE Sistema_Oftalmologia SHALL calcular automáticamente la edad basada en la fecha de nacimiento

### Requerimiento 3

**Historia de Usuario:** Como doctora oftalmóloga, quiero registrar los antecedentes médicos relevantes de cada paciente, para que pueda tomar decisiones clínicas informadas.

#### Criterios de Aceptación

1. WHEN se registran antecedentes médicos, THE Sistema_Oftalmologia SHALL almacenar estado de embarazo, lactancia, HTA y DM como campos booleanos
2. WHEN se ingresan otros antecedentes, THE Sistema_Oftalmologia SHALL permitir texto libre en el campo "otras"
3. WHEN se actualizan antecedentes, THE Sistema_Oftalmologia SHALL mantener historial de cambios con fecha y usuario
4. THE Sistema_Oftalmologia SHALL validar que los campos de antecedentes sean consistentes con el perfil del paciente
5. WHEN se consultan antecedentes, THE Sistema_Oftalmologia SHALL mostrar la información de forma clara y organizada

### Requerimiento 4

**Historia de Usuario:** Como doctora oftalmóloga, quiero registrar exámenes oftalmológicos completos para cada ojo, para que pueda documentar prescripciones y seguimiento de tratamientos.

#### Criterios de Aceptación

1. WHEN se registra un examen oftalmológico, THE Sistema_Oftalmologia SHALL almacenar por separado datos de OD y OI
2. WHEN se ingresan valores de esfera, cilindro, eje y DP, THE Sistema_Oftalmologia SHALL validar que sean valores numéricos dentro de rangos oftalmológicos válidos
3. WHEN se agregan comentarios al examen, THE Sistema_Oftalmologia SHALL permitir texto libre sin límite de caracteres
4. THE Sistema_Oftalmologia SHALL asociar cada examen con fecha, hora y usuario que lo registró
5. WHEN se consulta el historial de exámenes, THE Sistema_Oftalmologia SHALL mostrar todos los exámenes ordenados cronológicamente

### Requerimiento 5

**Historia de Usuario:** Como personal médico, quiero buscar pacientes rápidamente por RUT o nombre, para que pueda acceder eficientemente a su información durante la consulta.

#### Criterios de Aceptación

1. WHEN se busca por RUT completo, THE Sistema_Oftalmologia SHALL retornar el paciente exacto si existe
2. WHEN se busca por RUT parcial, THE Sistema_Oftalmologia SHALL mostrar todos los pacientes que coincidan con los dígitos ingresados
3. WHEN se busca por nombre o apellido, THE Sistema_Oftalmologia SHALL retornar todos los pacientes que contengan el texto ingresado
4. WHEN no se encuentran resultados, THE Sistema_Oftalmologia SHALL mostrar mensaje indicando que no hay coincidencias
5. THE Sistema_Oftalmologia SHALL mostrar resultados de búsqueda en tiempo real mientras se escribe

### Requerimiento 6

**Historia de Usuario:** Como doctora oftalmóloga, quiero imprimir recetas médicas con la información del paciente y prescripción, para que pueda entregar documentación oficial a mis pacientes.

#### Criterios de Aceptación

1. WHEN se solicita imprimir una receta, THE Sistema_Oftalmologia SHALL generar un documento PDF con formato médico profesional
2. WHEN se genera la receta, THE Sistema_Oftalmologia SHALL incluir datos del paciente, fecha del examen y prescripción oftalmológica
3. WHEN se imprime la receta, THE Sistema_Oftalmologia SHALL incluir información de contacto de la consulta y datos del médico
4. THE Sistema_Oftalmologia SHALL permitir vista previa antes de imprimir
5. WHEN se genera una receta, THE Sistema_Oftalmologia SHALL registrar la acción en el historial del paciente

### Requerimiento 7

**Historia de Usuario:** Como administradora del sistema, quiero que toda la información se almacene de forma segura y persistente, para que no se pierdan los datos médicos importantes.

#### Criterios de Aceptación

1. THE Sistema_Oftalmologia SHALL almacenar todos los datos en una base de datos relacional segura
2. WHEN se realizan cambios en los datos, THE Sistema_Oftalmologia SHALL confirmar la transacción antes de mostrar éxito
3. WHEN ocurre un error de base de datos, THE Sistema_Oftalmologia SHALL mostrar mensaje de error apropiado sin exponer detalles técnicos
4. THE Sistema_Oftalmologia SHALL realizar respaldos automáticos de la información
5. WHEN se accede a datos sensibles, THE Sistema_Oftalmologia SHALL registrar la actividad en logs de auditoría