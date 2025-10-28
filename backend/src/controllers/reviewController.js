import pool from '../config/database.js';
import cloudinary from '../config/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';

// Criar nova avaliação
export const createReview = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      productId,
      userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      isVerifiedPurchase
    } = req.body;

    // Validação
    if (!productId || !userId || !userName || !userEmail || !rating || !comment) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' });
    }

    const reviewId = uuidv4();

    // Inserir avaliação (converter boolean para inteiro)
    await connection.query(
      `INSERT INTO reviews (id, product_id, user_id, user_name, user_email, rating, title, comment, is_verified_purchase, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [reviewId, productId, userId, userName, userEmail, rating, title || '', comment, isVerifiedPurchase ? 1 : 0]
    );

    // Upload de imagens se houver
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: 'greenrush/reviews',
          resource_type: 'image'
        });

        await connection.query(
          'INSERT INTO review_images (review_id, image_url, cloudinary_public_id) VALUES (?, ?, ?)',
          [reviewId, result.secure_url, result.public_id]
        );
      }
    }

    // Upload de vídeo se houver
    if (req.files && req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
        folder: 'greenrush/reviews',
        resource_type: 'video'
      });

      await connection.query(
        'INSERT INTO review_videos (review_id, video_url, cloudinary_public_id) VALUES (?, ?, ?)',
        [reviewId, result.secure_url, result.public_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Avaliação criada com sucesso!',
      reviewId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Erro ao criar avaliação' });
  } finally {
    connection.release();
  }
};

// Listar avaliações de um produto
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status = 'approved' } = req.query;

    const [reviews] = await pool.query(
      `SELECT r.*,
        GROUP_CONCAT(DISTINCT ri.image_url) as images,
        MAX(rv.video_url) as video_url
       FROM reviews r
       LEFT JOIN review_images ri ON r.id = ri.review_id
       LEFT JOIN review_videos rv ON r.id = rv.review_id
       WHERE r.product_id = ? AND r.status = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [productId, status]
    );

    // Processar imagens (separar string em array)
    const processedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? review.images.split(',') : [],
      videoUrl: review.video_url || null
    }));

    res.json(processedReviews);

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
};

// Listar todas as avaliações (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT r.*,
        GROUP_CONCAT(DISTINCT ri.image_url) as images,
        MAX(rv.video_url) as video_url
      FROM reviews r
      LEFT JOIN review_images ri ON r.id = ri.review_id
      LEFT JOIN review_videos rv ON r.id = rv.review_id
    `;

    const params = [];
    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }

    query += ' GROUP BY r.id ORDER BY r.created_at DESC';

    const [reviews] = await pool.query(query, params);

    const processedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? review.images.split(',') : [],
      videoUrl: review.video_url || null
    }));

    res.json(processedReviews);

  } catch (error) {
    console.error('Erro ao buscar todas avaliações:', error);
    res.status(500).json({ error: 'Erro ao buscar avaliações' });
  }
};

// Atualizar status da avaliação (Admin)
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await pool.query(
      'UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status atualizado com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

// Deletar avaliação (Admin)
export const deleteReview = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Buscar imagens e vídeos para deletar do Cloudinary
    const [images] = await connection.query(
      'SELECT cloudinary_public_id FROM review_images WHERE review_id = ?',
      [id]
    );

    const [videos] = await connection.query(
      'SELECT cloudinary_public_id FROM review_videos WHERE review_id = ?',
      [id]
    );

    // Deletar do Cloudinary
    for (const img of images) {
      if (img.cloudinary_public_id) {
        await cloudinary.uploader.destroy(img.cloudinary_public_id);
      }
    }

    for (const vid of videos) {
      if (vid.cloudinary_public_id) {
        await cloudinary.uploader.destroy(vid.cloudinary_public_id, { resource_type: 'video' });
      }
    }

    // Deletar do banco (CASCADE deleta imagens e vídeos)
    await connection.query('DELETE FROM reviews WHERE id = ?', [id]);

    await connection.commit();

    res.json({ message: 'Avaliação deletada com sucesso' });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ error: 'Erro ao deletar avaliação' });
  } finally {
    connection.release();
  }
};

// Estatísticas de avaliações
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const [stats] = await pool.query(
      `SELECT
        COUNT(*) as total,
        COALESCE(AVG(rating), 0) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews
       WHERE product_id = ? AND status = 'approved'`,
      [productId]
    );

    // Garantir que average_rating seja um número
    const result = {
      ...stats[0],
      total: Number(stats[0].total),
      average_rating: Number(stats[0].average_rating) || 0,
      five_stars: Number(stats[0].five_stars) || 0,
      four_stars: Number(stats[0].four_stars) || 0,
      three_stars: Number(stats[0].three_stars) || 0,
      two_stars: Number(stats[0].two_stars) || 0,
      one_star: Number(stats[0].one_star) || 0
    };

    res.json(result);

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
