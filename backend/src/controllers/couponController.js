import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Criar cupom
export const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, usage_limit, expires_at } = req.body;

    if (!code || !discount_percent) {
      return res.status(400).json({ error: 'Código e porcentagem de desconto são obrigatórios' });
    }

    if (discount_percent < 0 || discount_percent > 100) {
      return res.status(400).json({ error: 'Desconto deve estar entre 0 e 100%' });
    }

    const couponId = uuidv4();

    await pool.query(
      `INSERT INTO coupons (id, code, discount_percent, usage_limit, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [couponId, code.toUpperCase(), discount_percent, usage_limit || null, expires_at || null]
    );

    res.status(201).json({
      id: couponId,
      code: code.toUpperCase(),
      discount_percent,
      usage_limit,
      expires_at,
      message: 'Cupom criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar cupom:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Este código de cupom já existe' });
    }

    res.status(500).json({ error: 'Erro ao criar cupom' });
  }
};

// Importar cupons via CSV
export const importCoupons = async (req, res) => {
  try {
    const { coupons } = req.body; // Array de { code, discount_percent }

    if (!Array.isArray(coupons) || coupons.length === 0) {
      return res.status(400).json({ error: 'Envie um array de cupons válido' });
    }

    const results = {
      success: 0,
      errors: [],
      duplicates: []
    };

    for (const coupon of coupons) {
      try {
        const { code, discount_percent } = coupon;

        if (!code || !discount_percent) {
          results.errors.push({ code, error: 'Código ou desconto inválido' });
          continue;
        }

        if (discount_percent < 0 || discount_percent > 100) {
          results.errors.push({ code, error: 'Desconto deve estar entre 0 e 100%' });
          continue;
        }

        const couponId = uuidv4();

        await pool.query(
          `INSERT INTO coupons (id, code, discount_percent)
           VALUES (?, ?, ?)`,
          [couponId, code.toUpperCase(), discount_percent]
        );

        results.success++;

      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          results.duplicates.push(coupon.code);
        } else {
          results.errors.push({ code: coupon.code, error: error.message });
        }
      }
    }

    res.json({
      message: `Importação concluída: ${results.success} cupons criados`,
      ...results
    });

  } catch (error) {
    console.error('Erro ao importar cupons:', error);
    res.status(500).json({ error: 'Erro ao importar cupons' });
  }
};

// Listar todos os cupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await pool.query(
      `SELECT * FROM coupons ORDER BY created_at DESC`
    );

    res.json(coupons);

  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    res.status(500).json({ error: 'Erro ao buscar cupons' });
  }
};

// Validar cupom (Público - para checkout)
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const [coupons] = await pool.query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado ou inativo' });
    }

    const coupon = coupons[0];

    // Verificar se expirou
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Cupom atingiu limite de usos' });
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      message: `Cupom válido! ${coupon.discount_percent}% de desconto`
    });

  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({ error: 'Erro ao validar cupom' });
  }
};

// Aplicar cupom (incrementar contador de uso)
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const [coupons] = await pool.query(
      `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE`,
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    const coupon = coupons[0];

    // Incrementar uso
    await pool.query(
      `UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?`,
      [coupon.id]
    );

    res.json({
      success: true,
      discount_percent: coupon.discount_percent
    });

  } catch (error) {
    console.error('Erro ao aplicar cupom:', error);
    res.status(500).json({ error: 'Erro ao aplicar cupom' });
  }
};

// Deletar cupom
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);

    res.json({ message: 'Cupom deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar cupom:', error);
    res.status(500).json({ error: 'Erro ao deletar cupom' });
  }
};

// Ativar/Desativar cupom
export const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await pool.query(
      'UPDATE coupons SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    res.json({ message: `Cupom ${is_active ? 'ativado' : 'desativado'} com sucesso` });

  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({ error: 'Erro ao atualizar cupom' });
  }
};
