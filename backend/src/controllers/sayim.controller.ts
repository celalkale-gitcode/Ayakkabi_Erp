import { Request, Response } from 'express';
import { SayimService } from '../services/sayim.service';

export const barkodOku = async (req: Request, res: Response) => {
  try {
    const { barkod, miktar } = req.body;
    
    if (!barkod) return res.status(400).json({ error: "Barkod gerekli" });

    const result = await SayimService.barkodlaSayimYap(barkod, miktar || 1);
    
    res.status(200).json({
      message: "Sayım başarıyla işlendi",
      data: result
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

