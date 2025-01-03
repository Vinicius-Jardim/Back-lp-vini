import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = "uploads";

// Configura o armazenamento em memória para manter os arquivos temporariamente
const storage = multer.memoryStorage();

// Filtro de arquivo para permitir somente tipos específicos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|mov/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Apenas imagens e certos vídeos são permitidos (jpeg, jpg, png, mp4, mov)"
      )
    );
  }
};

// Middleware do `multer` para aceitar múltiplos campos e armazenar arquivos em memória temporária
export const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // Limite de 50MB
  fileFilter: fileFilter,
}).fields([
  { name: "fotos", maxCount: 10 },
  { name: "videos", maxCount: 5 },
  { name: "plants", maxCount: 5 },
  { name: "profile", maxCount: 1 },
]);

export const saveFilePath = (req, res, next) => {
  const files = req.files;

  // Inicializa req.paths apenas se houver arquivos
  if (files) {
    req.paths = {}; // Garantir que req.paths começa vazio

    // Itera sobre os arquivos para processar os caminhos
    Object.keys(files).forEach((fieldName) => {
      if (files[fieldName]) {
        // Armazena os caminhos no req.paths
        req.paths[fieldName] = files[fieldName]
          .map((file) => {
            // Gera um nome de arquivo baseado no timestamp e no nome original
            const sanitizedFilename = file.originalname
              .replace(/[^a-z0-9.]/gi, "_")
              .toLowerCase();
            const filename = `${Date.now()}-${sanitizedFilename}`;
            const targetDir = path.join("uploads", fieldName);

            // Retorna o caminho completo sem salvar o arquivo no disco
            return path.join(targetDir, filename);
          })
          .filter(Boolean); // Remove valores `null` da lista
      }
    });
    // Passa o controle para o próximo middleware ou controlador
    next();
  } else {
    // Caso não haja arquivos, retorna um erro
    res.status(400).json({ error: "Nenhum arquivo enviado." });
  }
};

// Função para salvar arquivos do buffer para o disco
export const saveFilesToDisk = (files, paths) => {
  try {
    const savedPaths = {};

    // Lista dos tipos de arquivos que serão processados (profile, plants, videos, fotos)
    const fileTypes = ["profile", "plants", "videos", "fotos"];

    // Itera sobre os tipos de arquivos definidos
    fileTypes.forEach((fileType) => {
      const targetDir = path.join(uploadDir, fileType);

      // Verifica se o diretório existe e cria caso contrário
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Verifica se há arquivos e caminhos para o tipo atual
      const currentFiles = files[fileType];
      const currentPaths = paths[fileType];

      if (!currentFiles || !currentPaths) {
        console.warn(
          `Nenhum arquivo ou caminho fornecido para o tipo: ${fileType}`
        );
        return;
      }

      // Garante que tanto arquivos quanto caminhos sejam arrays
      const filesArray = Array.isArray(currentFiles)
        ? currentFiles
        : [currentFiles];
      const pathsArray = Array.isArray(currentPaths)
        ? currentPaths
        : [currentPaths];

      // Salva os arquivos para o tipo atual
      savedPaths[fileType] = filesArray
        .map((file, index) => {
          const pathFromSaveFilePath = pathsArray[index];

          if (pathFromSaveFilePath && file && file.buffer) {
            // Usa o caminho gerado previamente em saveFilePath
            const fullPath = path.join(pathFromSaveFilePath);

            // Salva o arquivo no disco usando o buffer
            fs.writeFileSync(fullPath, file.buffer);

            return fullPath; // Retorna o caminho completo do arquivo salvo
          } else {
            console.warn(
              `Caminho ou buffer não encontrado para o tipo de arquivo ${fileType}`
            );
            return null;
          }
        })
        .filter(Boolean); // Remove valores `null` da lista
    });

    return savedPaths;
  } catch (error) {
    console.error("Erro ao salvar arquivos no disco:", error);
    throw new Error("Problema na função saveFilesToDisk: " + error.message);
  }
};
