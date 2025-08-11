"""Configurações para emissão de NFS-e

Este módulo contém as configurações e funções para integração
com APIs de prefeituras para emissão de Nota Fiscal de Serviços Eletrônica (NFS-e)
"""

import os
import xml.etree.ElementTree as ET
from typing import Dict, Any, Optional
from datetime import datetime
import requests
from dataclasses import dataclass

@dataclass
class NFSConfig:
    """Configuração para emissão de NFS-e"""
    city_code: str
    city_name: str
    api_url: str
    certificate_path: Optional[str] = None
    certificate_password: Optional[str] = None
    environment: str = "homologacao"  # homologacao ou producao
    timeout: int = 30

# Configurações por cidade (principais cidades brasileiras)
CITY_CONFIGS = {
    "3550308": NFSConfig(  # São Paulo
        city_code="3550308",
        city_name="São Paulo",
        api_url="https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx"
    ),
    "3304557": NFSConfig(  # Rio de Janeiro
        city_code="3304557",
        city_name="Rio de Janeiro",
        api_url="https://notacarioca.rio.gov.br/WSNacional/nfse.asmx"
    ),
    "3106200": NFSConfig(  # Belo Horizonte
        city_code="3106200",
        city_name="Belo Horizonte",
        api_url="https://bhissdigital.pbh.gov.br/bhiss-ws/nfse"
    ),
    "4106902": NFSConfig(  # Curitiba
        city_code="4106902",
        city_name="Curitiba",
        api_url="https://isscuritiba.curitiba.pr.gov.br/Iss.NfseWebService/nfsews.asmx"
    ),
    "4314902": NFSConfig(  # Porto Alegre
        city_code="4314902",
        city_name="Porto Alegre",
        api_url="https://nfe.portoalegre.rs.gov.br/bhiss-ws/nfse"
    )
}

class NFSEService:
    """Serviço para emissão de NFS-e"""
    
    def __init__(self, city_code: str):
        self.config = CITY_CONFIGS.get(city_code)
        if not self.config:
            raise ValueError(f"Cidade com código {city_code} não configurada")
    
    def validate_invoice_data(self, invoice_data: Dict[str, Any]) -> bool:
        """Valida os dados obrigatórios para emissão da NFS-e"""
        required_fields = [
            'prestador_cnpj',
            'prestador_inscricao_municipal',
            'tomador_cnpj_cpf',
            'tomador_razao_social',
            'servico_codigo',
            'servico_descricao',
            'servico_valor',
            'servico_aliquota_iss'
        ]
        
        for field in required_fields:
            if not invoice_data.get(field):
                raise ValueError(f"Campo obrigatório não preenchido: {field}")
        
        # Validações específicas
        if len(invoice_data['prestador_cnpj']) != 14:
            raise ValueError("CNPJ do prestador deve ter 14 dígitos")
        
        if invoice_data['servico_valor'] <= 0:
            raise ValueError("Valor do serviço deve ser maior que zero")
        
        if not (0 <= invoice_data['servico_aliquota_iss'] <= 5):
            raise ValueError("Alíquota do ISS deve estar entre 0% e 5%")
        
        return True
    
    def generate_xml(self, invoice_data: Dict[str, Any]) -> str:
        """Gera XML para envio da NFS-e"""
        self.validate_invoice_data(invoice_data)
        
        # Criar estrutura XML básica (padrão ABRASF)
        root = ET.Element("EnviarLoteRpsEnvio")
        root.set("xmlns", "http://www.abrasf.org.br/nfse.xsd")
        
        # Identificação do lote
        lote_rps = ET.SubElement(root, "LoteRps")
        lote_rps.set("Id", f"lote_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        
        # Número do lote
        numero_lote = ET.SubElement(lote_rps, "NumeroLote")
        numero_lote.text = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # CNPJ do prestador
        cnpj = ET.SubElement(lote_rps, "Cnpj")
        cnpj.text = invoice_data['prestador_cnpj']
        
        # Inscrição municipal
        inscricao = ET.SubElement(lote_rps, "InscricaoMunicipal")
        inscricao.text = invoice_data['prestador_inscricao_municipal']
        
        # Quantidade de RPS
        qtd_rps = ET.SubElement(lote_rps, "QuantidadeRps")
        qtd_rps.text = "1"
        
        # Lista de RPS
        lista_rps = ET.SubElement(lote_rps, "ListaRps")
        rps = ET.SubElement(lista_rps, "Rps")
        
        # Informações do RPS
        info_rps = ET.SubElement(rps, "InfRps")
        info_rps.set("Id", f"rps_{datetime.now().strftime('%Y%m%d%H%M%S')}")
        
        # Identificação do RPS
        ident_rps = ET.SubElement(info_rps, "IdentificacaoRps")
        numero_rps = ET.SubElement(ident_rps, "Numero")
        numero_rps.text = datetime.now().strftime('%Y%m%d%H%M%S')
        
        serie_rps = ET.SubElement(ident_rps, "Serie")
        serie_rps.text = "1"
        
        tipo_rps = ET.SubElement(ident_rps, "Tipo")
        tipo_rps.text = "1"  # RPS
        
        # Data de emissão
        data_emissao = ET.SubElement(info_rps, "DataEmissao")
        data_emissao.text = datetime.now().strftime('%Y-%m-%d')
        
        # Natureza da operação
        natureza = ET.SubElement(info_rps, "NaturezaOperacao")
        natureza.text = "1"  # Tributação no município
        
        # Status do RPS
        status_rps = ET.SubElement(info_rps, "Status")
        status_rps.text = "1"  # Normal
        
        # Serviços
        servico = ET.SubElement(info_rps, "Servico")
        
        # Valores
        valores = ET.SubElement(servico, "Valores")
        
        valor_servicos = ET.SubElement(valores, "ValorServicos")
        valor_servicos.text = f"{invoice_data['servico_valor']:.2f}"
        
        valor_iss = ET.SubElement(valores, "ValorIss")
        iss_value = invoice_data['servico_valor'] * (invoice_data['servico_aliquota_iss'] / 100)
        valor_iss.text = f"{iss_value:.2f}"
        
        aliquota = ET.SubElement(valores, "Aliquota")
        aliquota.text = f"{invoice_data['servico_aliquota_iss']:.2f}"
        
        # Código do serviço
        codigo_servico = ET.SubElement(servico, "CodigoTributacaoMunicipio")
        codigo_servico.text = invoice_data['servico_codigo']
        
        # Discriminação
        discriminacao = ET.SubElement(servico, "Discriminacao")
        discriminacao.text = invoice_data['servico_descricao']
        
        # Prestador
        prestador = ET.SubElement(info_rps, "Prestador")
        cnpj_prestador = ET.SubElement(prestador, "Cnpj")
        cnpj_prestador.text = invoice_data['prestador_cnpj']
        
        inscricao_prestador = ET.SubElement(prestador, "InscricaoMunicipal")
        inscricao_prestador.text = invoice_data['prestador_inscricao_municipal']
        
        # Tomador
        tomador = ET.SubElement(info_rps, "Tomador")
        ident_tomador = ET.SubElement(tomador, "IdentificacaoTomador")
        
        cpf_cnpj_tomador = ET.SubElement(ident_tomador, "CpfCnpj")
        if len(invoice_data['tomador_cnpj_cpf']) == 11:
            cpf = ET.SubElement(cpf_cnpj_tomador, "Cpf")
            cpf.text = invoice_data['tomador_cnpj_cpf']
        else:
            cnpj_tom = ET.SubElement(cpf_cnpj_tomador, "Cnpj")
            cnpj_tom.text = invoice_data['tomador_cnpj_cpf']
        
        razao_social = ET.SubElement(tomador, "RazaoSocial")
        razao_social.text = invoice_data['tomador_razao_social']
        
        # Endereço do tomador (se fornecido)
        if invoice_data.get('tomador_endereco'):
            endereco = ET.SubElement(tomador, "Endereco")
            logradouro = ET.SubElement(endereco, "Endereco")
            logradouro.text = invoice_data['tomador_endereco'].get('logradouro', '')
            
            numero = ET.SubElement(endereco, "Numero")
            numero.text = invoice_data['tomador_endereco'].get('numero', '')
            
            bairro = ET.SubElement(endereco, "Bairro")
            bairro.text = invoice_data['tomador_endereco'].get('bairro', '')
            
            cidade = ET.SubElement(endereco, "CodigoMunicipio")
            cidade.text = invoice_data['tomador_endereco'].get('codigo_municipio', self.config.city_code)
            
            uf = ET.SubElement(endereco, "Uf")
            uf.text = invoice_data['tomador_endereco'].get('uf', '')
            
            cep = ET.SubElement(endereco, "Cep")
            cep.text = invoice_data['tomador_endereco'].get('cep', '')
        
        return ET.tostring(root, encoding='unicode')
    
    def send_invoice(self, xml_data: str) -> Dict[str, Any]:
        """Envia a NFS-e para a prefeitura"""
        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://www.abrasf.org.br/nfse.xsd/EnviarLoteRps'
        }
        
        # Envelope SOAP
        soap_envelope = f"""
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                {xml_data}
            </soap:Body>
        </soap:Envelope>
        """
        
        try:
            response = requests.post(
                self.config.api_url,
                data=soap_envelope,
                headers=headers,
                timeout=self.config.timeout
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'response': response.text,
                    'status_code': response.status_code
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}: {response.text}",
                    'status_code': response.status_code
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f"Erro de conexão: {str(e)}",
                'status_code': 0
            }
    
    def check_invoice_status(self, protocol_number: str) -> Dict[str, Any]:
        """Consulta o status de uma NFS-e pelo número do protocolo"""
        # Implementar consulta de status específica para cada cidade
        # Por enquanto, retorna um status simulado
        return {
            'protocol': protocol_number,
            'status': 'processed',
            'nfs_number': f"NFS{protocol_number}",
            'verification_code': f"VER{protocol_number}"
        }
    
    def download_pdf(self, nfs_number: str, verification_code: str) -> bytes:
        """Faz download do PDF da NFS-e"""
        # Implementar download específico para cada cidade
        # Por enquanto, retorna dados simulados
        return b"PDF content would be here"

def get_available_cities() -> Dict[str, str]:
    """Retorna lista de cidades disponíveis para emissão de NFS-e"""
    return {code: config.city_name for code, config in CITY_CONFIGS.items()}

def create_nfse_service(city_code: str) -> NFSEService:
    """Factory para criar serviço de NFS-e"""
    return NFSEService(city_code)

# Códigos de serviço mais comuns para clínicas médicas
SERVICE_CODES = {
    "consulta_medica": "04.01",
    "exame_laboratorial": "04.02",
    "exame_imagem": "04.03",
    "procedimento_cirurgico": "04.04",
    "fisioterapia": "04.05",
    "psicologia": "04.06",
    "nutricao": "04.07",
    "odontologia": "04.08",
    "outros_servicos_saude": "04.99"
}

def get_service_codes() -> Dict[str, str]:
    """Retorna códigos de serviço disponíveis"""
    return SERVICE_CODES